import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../cubit/matches_cubit.dart';

class MatchesScreen extends StatefulWidget {
  const MatchesScreen({super.key});

  @override
  State<MatchesScreen> createState() => _MatchesScreenState();
}

class _MatchesScreenState extends State<MatchesScreen> {
  @override
  void initState() {
    super.initState();
    context.read<MatchesCubit>().load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Matches')),
      body: BlocBuilder<MatchesCubit, MatchesState>(
        builder: (ctx, state) {
          if (state is MatchesLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state is MatchesError) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.grey),
                  const SizedBox(height: 12),
                  Text(state.message),
                  TextButton(
                    onPressed: () => ctx.read<MatchesCubit>().load(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }
          if (state is MatchesLoaded) {
            if (state.matches.isEmpty) {
              return const _EmptyMatches();
            }
            return RefreshIndicator(
              onRefresh: () => ctx.read<MatchesCubit>().load(),
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: state.matches.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (_, i) => _MatchTile(match: state.matches[i]),
              ),
            );
          }
          return const SizedBox();
        },
      ),
    );
  }
}

class _MatchTile extends StatelessWidget {
  final Map<String, dynamic> match;
  const _MatchTile({required this.match});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final stage = match['revealStage'] ?? 1;
    final score = match['compatibilityScore'] ?? 0;
    final lastMsg = match['lastMessageAt'];
    final timeStr = lastMsg != null
        ? timeago.format(DateTime.parse(lastMsg))
        : 'New match!';

    return Card(
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Stack(
          children: [
            CircleAvatar(
              radius: 28,
              backgroundColor: cs.primaryContainer,
              child: Icon(
                stage >= 3 ? Icons.person : Icons.person_outline,
                color: cs.primary,
                size: 28,
              ),
            ),
            Positioned(
              right: 0,
              bottom: 0,
              child: Container(
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  color: cs.primary,
                  shape: BoxShape.circle,
                ),
                child: Text(
                  'S$stage',
                  style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
        title: Text(
          stage >= 3 ? (match['displayName'] ?? 'Anonymous') : '✨ Anonymous',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(timeStr, style: TextStyle(color: cs.onSurfaceVariant, fontSize: 12)),
            const SizedBox(height: 4),
            LinearProgressIndicator(
              value: (score as num).toDouble() / 100,
              backgroundColor: cs.primaryContainer,
              valueColor: AlwaysStoppedAnimation<Color>(cs.primary),
            ),
          ],
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              '${score.round()}%',
              style: TextStyle(
                color: cs.primary,
                fontWeight: FontWeight.w700,
                fontSize: 16,
              ),
            ),
            const Text('match', style: TextStyle(fontSize: 10, color: Colors.grey)),
          ],
        ),
        onTap: () => context.go('/chat/${match['id']}'),
      ),
    );
  }
}

class _EmptyMatches extends StatelessWidget {
  const _EmptyMatches();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.favorite_border_rounded, size: 80, color: Colors.grey),
          const SizedBox(height: 16),
          Text(
            'No matches yet',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          const Text(
            'Keep swiping to find your match!',
            style: TextStyle(color: Colors.grey),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => context.go('/'),
            child: const Text('Discover Profiles'),
          ),
        ],
      ),
    );
  }
}
