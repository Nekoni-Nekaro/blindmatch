import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class MainShell extends StatelessWidget {
  final Widget child;
  const MainShell({super.key, required this.child});

  static const _tabs = [
    (icon: Icons.whatshot_rounded, label: 'Discover', path: '/'),
    (icon: Icons.favorite_rounded, label: 'Matches', path: '/matches'),
    (icon: Icons.people_rounded, label: 'Rooms', path: '/rooms'),
    (icon: Icons.person_rounded, label: 'Profile', path: '/profile'),
  ];

  int _currentIndex(BuildContext context) {
    final loc = GoRouterState.of(context).matchedLocation;
    for (var i = 0; i < _tabs.length; i++) {
      if (loc.startsWith(_tabs[i].path) && (_tabs[i].path != '/' || loc == '/')) {
        return i;
      }
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final idx = _currentIndex(context);
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: idx,
        onDestinationSelected: (i) => context.go(_tabs[i].path),
        destinations: _tabs
            .map((t) => NavigationDestination(
                  icon: Icon(t.icon),
                  label: t.label,
                ))
            .toList(),
      ),
    );
  }
}
