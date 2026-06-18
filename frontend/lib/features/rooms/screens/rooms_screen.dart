import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class RoomsScreen extends StatefulWidget {
  const RoomsScreen({super.key});

  @override
  State<RoomsScreen> createState() => _RoomsScreenState();
}

class _RoomsScreenState extends State<RoomsScreen> {
  List<Map<String, dynamic>> _rooms = [];
  bool _loading = true;
  String? _selectedTopic;

  static const _topics = [
    ('All', null),
    ('🎮 Gaming', 'gaming'),
    ('🎵 Music', 'music'),
    ('✈️ Travel', 'travel'),
    ('📚 Books', 'books'),
    ('🎌 Anime', 'anime'),
    ('💪 Fitness', 'fitness'),
    ('🍜 Food', 'food'),
    ('💻 Tech', 'tech'),
  ];

  @override
  void initState() {
    super.initState();
    _loadRooms();
  }

  Future<void> _loadRooms() async {
    setState(() => _loading = true);
    try {
      final api = context.read<ApiClient>();
      final list = await api.getRooms(topic: _selectedTopic);
      setState(() {
        _rooms = List<Map<String, dynamic>>.from(list);
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Interest Rooms')),
      body: Column(
        children: [
          // Topic filters
          SizedBox(
            height: 48,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _topics.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (_, i) {
                final (label, topic) = _topics[i];
                final selected = _selectedTopic == topic;
                return FilterChip(
                  label: Text(label),
                  selected: selected,
                  onSelected: (_) {
                    setState(() => _selectedTopic = topic);
                    _loadRooms();
                  },
                  selectedColor: cs.primaryContainer,
                );
              },
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 1.2,
                    ),
                    itemCount: _rooms.length,
                    itemBuilder: (_, i) => _RoomCard(room: _rooms[i]),
                  ),
          ),
        ],
      ),
    );
  }
}

class _RoomCard extends StatelessWidget {
  final Map<String, dynamic> room;
  const _RoomCard({required this.room});

  static const _topicColors = {
    'gaming': Colors.purple,
    'music': Colors.pink,
    'travel': Colors.teal,
    'books': Colors.brown,
    'anime': Colors.indigo,
    'fitness': Colors.green,
    'food': Colors.orange,
    'tech': Colors.blue,
    'art': Colors.red,
    'film': Colors.cyan,
  };

  static const _topicIcons = {
    'gaming': '🎮',
    'music': '🎵',
    'travel': '✈️',
    'books': '📚',
    'anime': '🎌',
    'fitness': '💪',
    'food': '🍜',
    'tech': '💻',
    'art': '🎨',
    'film': '🎬',
  };

  @override
  Widget build(BuildContext context) {
    final topic = room['topic'] ?? '';
    final color = _topicColors[topic] ?? Colors.grey;
    final icon = _topicIcons[topic] ?? '💬';
    final members = room['membersCount'] ?? 0;

    return Card(
      child: InkWell(
        onTap: () {}, // Navigate to room detail
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(icon, style: const TextStyle(fontSize: 28)),
              const Spacer(),
              Text(
                room['name'] ?? '',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Icon(Icons.people, size: 12, color: color),
                  const SizedBox(width: 4),
                  Text(
                    '$members members',
                    style: TextStyle(fontSize: 11, color: color),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
