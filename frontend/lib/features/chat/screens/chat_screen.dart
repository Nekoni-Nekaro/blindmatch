import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../../../core/api/api_client.dart';

class ChatScreen extends StatefulWidget {
  final String matchId;
  const ChatScreen({super.key, required this.matchId});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _ctrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  List<Map<String, dynamic>> _messages = [];
  bool _loading = true;
  bool _partnerTyping = false;
  io.Socket? _socket;
  String? _myUserId;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    final api = context.read<ApiClient>();
    final token = await api.getToken();
    final me = await api.getMe();
    _myUserId = me['id'];

    // Load message history
    final msgs = await api.getMessages(widget.matchId);
    setState(() {
      _messages = List<Map<String, dynamic>>.from(msgs);
      _loading = false;
    });

    // Connect WebSocket
    _socket = io.io(
      'wss://api.blindmatch.app/chat',
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .build(),
    );

    _socket!
      ..onConnect((_) {
        _socket!.emit('join_match', {'matchId': widget.matchId});
        _socket!.emit('read_messages', {'matchId': widget.matchId});
      })
      ..on('new_message', (data) {
        if (mounted) {
          setState(() => _messages.add(Map<String, dynamic>.from(data)));
          _scrollToBottom();
        }
      })
      ..on('typing', (data) {
        if (data['userId'] != _myUserId && mounted) {
          setState(() => _partnerTyping = data['isTyping'] ?? false);
        }
      });

    _scrollToBottom();
  }

  @override
  void dispose() {
    _socket?.emit('leave_match', {'matchId': widget.matchId});
    _socket?.disconnect();
    _ctrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _onTyping(String v) {
    _socket?.emit('typing', {'matchId': widget.matchId, 'isTyping': v.isNotEmpty});
  }

  Future<void> _send() async {
    final text = _ctrl.text.trim();
    if (text.isEmpty) return;
    _ctrl.clear();
    _socket?.emit('typing', {'matchId': widget.matchId, 'isTyping': false});
    _socket?.emit('send_message', {
      'matchId': widget.matchId,
      'content': text,
      'type': 'text',
    });
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('✨ Anonymous Match'),
            if (_partnerTyping)
              Text(
                'typing...',
                style: TextStyle(fontSize: 12, color: cs.primary),
              ),
          ],
        ),
        actions: [
          IconButton(icon: const Icon(Icons.auto_awesome), onPressed: _showIcebreakers),
          IconButton(icon: const Icon(Icons.lock_open_rounded), onPressed: _requestReveal),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    controller: _scrollCtrl,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    itemCount: _messages.length,
                    itemBuilder: (_, i) => _MessageBubble(
                      message: _messages[i],
                      isMe: _messages[i]['senderId'] == _myUserId,
                    ),
                  ),
                ),
                _InputBar(ctrl: _ctrl, onTyping: _onTyping, onSend: _send),
              ],
            ),
    );
  }

  void _showIcebreakers() async {
    final api = context.read<ApiClient>();
    final icebreakers = await api.getIcebreakers(widget.matchId);
    if (!mounted) return;
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => _IcebreakersSheet(
        icebreakers: icebreakers,
        onSelect: (q) {
          _ctrl.text = q;
          Navigator.pop(context);
        },
      ),
    );
  }

  void _requestReveal() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Request Reveal?'),
        content: const Text(
          'Ask your match to reveal more about themselves? '
          'Both of you need to agree for the next stage.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              await context.read<ApiClient>().requestReveal(widget.matchId);
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Reveal request sent!')),
                );
              }
            },
            child: const Text('Request'),
          ),
        ],
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final Map<String, dynamic> message;
  final bool isMe;

  const _MessageBubble({required this.message, required this.isMe});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        decoration: BoxDecoration(
          color: isMe ? cs.primary : cs.surfaceContainerHighest,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(18),
            topRight: const Radius.circular(18),
            bottomLeft: Radius.circular(isMe ? 18 : 4),
            bottomRight: Radius.circular(isMe ? 4 : 18),
          ),
        ),
        child: Text(
          message['content'] ?? '',
          style: TextStyle(
            color: isMe ? Colors.white : cs.onSurface,
            fontSize: 15,
          ),
        ),
      ),
    );
  }
}

class _InputBar extends StatelessWidget {
  final TextEditingController ctrl;
  final ValueChanged<String> onTyping;
  final VoidCallback onSend;

  const _InputBar({required this.ctrl, required this.onTyping, required this.onSend});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: ctrl,
                onChanged: onTyping,
                maxLines: null,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => onSend(),
                decoration: InputDecoration(
                  hintText: 'Type a message...',
                  filled: true,
                  fillColor: cs.surfaceContainerHighest,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: onSend,
              child: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: cs.primary,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _IcebreakersSheet extends StatelessWidget {
  final List<String> icebreakers;
  final ValueChanged<String> onSelect;

  const _IcebreakersSheet({required this.icebreakers, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('💡 AI Icebreakers', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 4),
          Text('Tap to use', style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant)),
          const SizedBox(height: 16),
          ...icebreakers.map((q) => ListTile(
                leading: const Icon(Icons.auto_awesome_rounded),
                title: Text(q),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                onTap: () => onSelect(q),
              )),
        ],
      ),
    );
  }
}
