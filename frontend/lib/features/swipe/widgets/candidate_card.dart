import 'package:flutter/material.dart';

class CandidateCard extends StatelessWidget {
  final Map<String, dynamic> profile;
  final VoidCallback onLike;
  final VoidCallback onPass;

  const CandidateCard({
    super.key,
    required this.profile,
    required this.onLike,
    required this.onPass,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tags = (profile['interestTags'] as List?)?.cast<String>() ?? [];
    final personalityTags = (profile['personalityTags'] as List?)?.cast<String>() ?? [];
    final goal = profile['relationshipGoal'] ?? '';
    final mbti = profile['personalityType'] ?? '';

    return Card(
      elevation: 8,
      shadowColor: cs.primary.withOpacity(0.15),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Blind header - no photo
            Center(
              child: Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [cs.primaryContainer, cs.secondaryContainer],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.person_rounded,
                  size: 52,
                  color: cs.primary,
                ),
              ),
            ),
            const SizedBox(height: 8),
            // Anonymous label
            Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: cs.primaryContainer,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '✨ Anonymous Profile',
                  style: TextStyle(color: cs.primary, fontSize: 12, fontWeight: FontWeight.w500),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Description
            if (profile['description'] != null) ...[
              Text(
                'About',
                style: Theme.of(context).textTheme.labelLarge,
              ),
              const SizedBox(height: 6),
              Text(
                profile['description'],
                style: Theme.of(context).textTheme.bodyMedium,
                maxLines: 4,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 16),
            ],

            // Goal & MBTI row
            Row(
              children: [
                if (goal.isNotEmpty)
                  _Chip(
                    icon: Icons.favorite_border_rounded,
                    label: goal.replaceAll('_', ' '),
                    color: Colors.pink,
                  ),
                const SizedBox(width: 8),
                if (mbti.isNotEmpty)
                  _Chip(icon: Icons.psychology_rounded, label: mbti, color: Colors.purple),
              ],
            ),
            const SizedBox(height: 16),

            // Interests
            if (tags.isNotEmpty) ...[
              Text('Interests', style: Theme.of(context).textTheme.labelLarge),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: tags
                    .take(8)
                    .map((t) => _TagChip(label: t, color: cs.primaryContainer, textColor: cs.primary))
                    .toList(),
              ),
              const SizedBox(height: 16),
            ],

            // Personality tags
            if (personalityTags.isNotEmpty) ...[
              Text('Personality', style: Theme.of(context).textTheme.labelLarge),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: personalityTags
                    .take(5)
                    .map((t) => _TagChip(
                          label: t,
                          color: cs.secondaryContainer,
                          textColor: cs.secondary,
                        ))
                    .toList(),
              ),
            ],

            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  const _Chip({required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}

class _TagChip extends StatelessWidget {
  final String label;
  final Color color;
  final Color textColor;
  const _TagChip({required this.label, required this.color, required this.textColor});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 12, color: textColor, fontWeight: FontWeight.w500),
      ),
    );
  }
}
