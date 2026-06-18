import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/api/api_client.dart';
import '../widgets/candidate_card.dart';

class SwipeScreen extends StatefulWidget {
  const SwipeScreen({super.key});

  @override
  State<SwipeScreen> createState() => _SwipeScreenState();
}

class _SwipeScreenState extends State<SwipeScreen> {
  List<Map<String, dynamic>> _candidates = [];
  bool _loading = true;
  String? _error;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadCandidates();
  }

  Future<void> _loadCandidates() async {
    setState(() { _loading = true; _error = null; });
    try {
      final api = context.read<ApiClient>();
      final list = await api.getCandidates(limit: 20);
      setState(() {
        _candidates = List<Map<String, dynamic>>.from(list);
        _loading = false;
      });
    } catch (e) {
      setState(() { _error = e.toString(); _loading = false; });
    }
  }

  Future<void> _onLike() async {
    if (_currentIndex >= _candidates.length) return;
    final candidate = _candidates[_currentIndex];
    final api = context.read<ApiClient>();
    try {
      final result = await api.likeProfile(candidate['id'] ?? candidate['userId']);
      if (result['isNewMatch'] == true) {
        _showMatchDialog(candidate);
      }
    } catch (_) {}
    setState(() => _currentIndex++);
    if (_currentIndex >= _candidates.length - 3) _loadMore();
  }

  Future<void> _onPass() async {
    if (_currentIndex >= _candidates.length) return;
    final candidate = _candidates[_currentIndex];
    context.read<ApiClient>().passProfile(candidate['id'] ?? candidate['userId']);
    setState(() => _currentIndex++);
    if (_currentIndex >= _candidates.length - 3) _loadMore();
  }

  Future<void> _loadMore() async {
    final api = context.read<ApiClient>();
    final more = await api.getCandidates(limit: 10);
    setState(() {
      _candidates.addAll(List<Map<String, dynamic>>.from(more));
    });
  }

  void _showMatchDialog(Map<String, dynamic> candidate) {
    showDialog(
      context: context,
      builder: (_) => _MatchDialog(candidate: candidate),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.favorite_rounded, color: cs.primary, size: 20),
            const SizedBox(width: 8),
            const Text('BlindMatch'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.tune_rounded),
            onPressed: () {}, // Filters
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_loading && _candidates.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_error != null && _candidates.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.wifi_off, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            const Text('Failed to load profiles'),
            const SizedBox(height: 12),
            ElevatedButton(onPressed: _loadCandidates, child: const Text('Retry')),
          ],
        ),
      );
    }
    if (_currentIndex >= _candidates.length) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.sentiment_satisfied_alt, size: 80, color: Colors.grey),
            const SizedBox(height: 16),
            const Text('You\'ve seen everyone for now!'),
            const SizedBox(height: 12),
            ElevatedButton(onPressed: _loadCandidates, child: const Text('Refresh')),
          ],
        ),
      );
    }

    final candidate = _candidates[_currentIndex];
    return Column(
      children: [
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: CandidateCard(
              profile: candidate,
              onLike: _onLike,
              onPass: _onPass,
            ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.05),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(bottom: 24),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _ActionButton(
                icon: Icons.close,
                color: Colors.red,
                size: 60,
                onTap: _onPass,
              ),
              _ActionButton(
                icon: Icons.star_rounded,
                color: Colors.amber,
                size: 48,
                onTap: _onLike, // super like
              ),
              _ActionButton(
                icon: Icons.favorite_rounded,
                color: const Color(0xFF6C63FF),
                size: 60,
                onTap: _onLike,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final Color color;
  final double size;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.color,
    required this.size,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.25),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Icon(icon, color: color, size: size * 0.45),
      ),
    );
  }
}

class _MatchDialog extends StatelessWidget {
  final Map<String, dynamic> candidate;
  const _MatchDialog({required this.candidate});

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.favorite, color: Color(0xFF6C63FF), size: 64),
            const SizedBox(height: 16),
            Text(
              'It\'s a Match! 🎉',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              'You and this person both liked each other.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Start Chatting'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Keep Swiping'),
            ),
          ],
        ),
      ),
    );
  }
}
