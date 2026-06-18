import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../core/auth/auth_cubit.dart';
import '../cubit/profile_cubit.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  void initState() {
    super.initState();
    context.read<ProfileCubit>().load();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_rounded),
            onPressed: () => context.go('/profile/edit'),
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded),
            onPressed: () => _confirmLogout(context),
          ),
        ],
      ),
      body: BlocBuilder<ProfileCubit, ProfileState>(
        builder: (ctx, state) {
          if (state is ProfileLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state is ProfileLoaded) {
            return _ProfileContent(profile: state.profile);
          }
          return Center(
            child: TextButton(
              onPressed: () => ctx.read<ProfileCubit>().load(),
              child: const Text('Load Profile'),
            ),
          );
        },
      ),
    );
  }

  void _confirmLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Log Out?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              context.read<AuthCubit>().logout();
            },
            child: const Text('Log Out'),
          ),
        ],
      ),
    );
  }
}

class _ProfileContent extends StatelessWidget {
  final Map<String, dynamic> profile;
  const _ProfileContent({required this.profile});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tags = (profile['interestTags'] as List?)?.cast<String>() ?? [];
    final isComplete = profile['isComplete'] ?? false;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Avatar
          Center(
            child: Stack(
              children: [
                CircleAvatar(
                  radius: 52,
                  backgroundColor: cs.primaryContainer,
                  child: Icon(Icons.person_rounded, size: 52, color: cs.primary),
                ),
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: GestureDetector(
                    onTap: () => context.go('/profile/edit'),
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(color: cs.primary, shape: BoxShape.circle),
                      child: const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 16),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          if (!isComplete)
            Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: cs.tertiaryContainer,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, color: cs.tertiary),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Complete your profile to start matching!',
                      style: TextStyle(color: cs.onTertiaryContainer),
                    ),
                  ),
                  TextButton(
                    onPressed: () => context.go('/profile/edit'),
                    child: const Text('Edit'),
                  ),
                ],
              ),
            ),

          // Bio
          if (profile['description'] != null) ...[
            Text('About Me', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            Text(profile['description']),
            const SizedBox(height: 20),
          ],

          // Stats row
          Row(
            children: [
              _StatCard(label: 'Views', value: '${profile['profileViews'] ?? 0}'),
              const SizedBox(width: 12),
              _StatCard(label: 'Likes', value: '${profile['likesReceived'] ?? 0}'),
              const SizedBox(width: 12),
              _StatCard(label: 'Stage', value: 'S${profile['revealStage'] ?? 1}'),
            ],
          ),
          const SizedBox(height: 20),

          // Interests
          if (tags.isNotEmpty) ...[
            Text('My Interests', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: tags
                  .map((t) => Chip(
                        label: Text(t),
                        backgroundColor: cs.primaryContainer,
                        labelStyle: TextStyle(color: cs.primary, fontSize: 13),
                        side: BorderSide.none,
                      ))
                  .toList(),
            ),
          ],
          const SizedBox(height: 32),
          OutlinedButton.icon(
            onPressed: () => context.go('/profile/edit'),
            icon: const Icon(Icons.edit_rounded),
            label: const Text('Edit Profile'),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(double.infinity, 48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  const _StatCard({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: cs.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          children: [
            Text(value,
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
            const SizedBox(height: 2),
            Text(label, style: TextStyle(color: cs.onSurfaceVariant, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}
