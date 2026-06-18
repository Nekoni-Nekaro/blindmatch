import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../cubit/profile_cubit.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _descCtrl = TextEditingController();
  final _qdCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  String? _selectedGoal;
  String? _selectedMbti;
  List<String> _selectedTags = [];

  static const _goals = ['serious', 'casual', 'friendship', 'networking', 'not_sure'];
  static const _mbtiTypes = [
    'INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP',
    'ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP',
  ];
  static const _allTags = [
    'Anime', 'Gaming', 'Music', 'Travel', 'Reading', 'Cooking',
    'Photography', 'Fitness', 'Art', 'Movies', 'Nature', 'Technology',
    'Coffee', 'Dancing', 'Yoga', 'Hiking', 'Coding', 'Design',
    'Philosophy', 'Languages', 'Cats', 'Dogs', 'Astronomy', 'History',
  ];

  @override
  void initState() {
    super.initState();
    final state = context.read<ProfileCubit>().state;
    if (state is ProfileLoaded) {
      _descCtrl.text = state.profile['description'] ?? '';
      _qdCtrl.text = state.profile['questionOfDayAnswer'] ?? '';
      _nameCtrl.text = state.profile['displayName'] ?? '';
      _selectedGoal = state.profile['relationshipGoal'];
      _selectedMbti = state.profile['personalityType'];
      _selectedTags = List<String>.from(state.profile['interestTags'] ?? []);
    }
  }

  @override
  void dispose() {
    _descCtrl.dispose();
    _qdCtrl.dispose();
    _nameCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    await context.read<ProfileCubit>().update({
      'description': _descCtrl.text,
      'questionOfDayAnswer': _qdCtrl.text,
      'displayName': _nameCtrl.text,
      if (_selectedGoal != null) 'relationshipGoal': _selectedGoal,
      if (_selectedMbti != null) 'personalityType': _selectedMbti,
      'interestTags': _selectedTags,
    });
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profile saved!'),
          backgroundColor: Colors.green,
        ),
      );
      context.go('/profile');
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Profile'),
        actions: [
          TextButton(
            onPressed: _save,
            child: const Text('Save', style: TextStyle(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Name
              Text('Display Name (shown after stage 3)',
                  style: Theme.of(context).textTheme.labelLarge),
              const SizedBox(height: 8),
              TextFormField(
                controller: _nameCtrl,
                decoration: const InputDecoration(hintText: 'Your first name or nickname'),
              ),
              const SizedBox(height: 20),

              // About
              Text('About You', style: Theme.of(context).textTheme.labelLarge),
              const SizedBox(height: 8),
              TextFormField(
                controller: _descCtrl,
                maxLines: 4,
                maxLength: 500,
                decoration: const InputDecoration(
                  hintText: 'Tell people about yourself...',
                ),
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Please write something about yourself';
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Daily question answer
              Text('Question of the Day', style: Theme.of(context).textTheme.labelLarge),
              const SizedBox(height: 8),
              TextFormField(
                controller: _qdCtrl,
                maxLines: 2,
                maxLength: 300,
                decoration: const InputDecoration(
                  hintText: 'Answer the daily question...',
                ),
              ),
              const SizedBox(height: 20),

              // Relationship goal
              Text('Looking For', style: Theme.of(context).textTheme.labelLarge),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _goals.map((g) {
                  final selected = _selectedGoal == g;
                  return FilterChip(
                    label: Text(g.replaceAll('_', ' ')),
                    selected: selected,
                    onSelected: (_) => setState(() => _selectedGoal = g),
                    selectedColor: cs.primaryContainer,
                    checkmarkColor: cs.primary,
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),

              // MBTI
              Text('MBTI Type', style: Theme.of(context).textTheme.labelLarge),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _selectedMbti,
                decoration: const InputDecoration(hintText: 'Select your type'),
                items: _mbtiTypes
                    .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                    .toList(),
                onChanged: (v) => setState(() => _selectedMbti = v),
              ),
              const SizedBox(height: 20),

              // Interests
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Interests', style: Theme.of(context).textTheme.labelLarge),
                  Text(
                    '${_selectedTags.length}/100',
                    style: TextStyle(color: cs.onSurfaceVariant, fontSize: 12),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _allTags.map((t) {
                  final selected = _selectedTags.contains(t);
                  return FilterChip(
                    label: Text(t),
                    selected: selected,
                    onSelected: (_) => setState(() {
                      if (selected) _selectedTags.remove(t);
                      else if (_selectedTags.length < 100) _selectedTags.add(t);
                    }),
                    selectedColor: cs.primaryContainer,
                    checkmarkColor: cs.primary,
                  );
                }).toList(),
              ),
              const SizedBox(height: 32),
              ElevatedButton(onPressed: _save, child: const Text('Save Profile')),
            ],
          ),
        ),
      ),
    );
  }
}
