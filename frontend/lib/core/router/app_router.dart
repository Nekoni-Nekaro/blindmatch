import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../auth/auth_cubit.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/swipe/screens/swipe_screen.dart';
import '../../features/matches/screens/matches_screen.dart';
import '../../features/chat/screens/chat_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../features/profile/screens/edit_profile_screen.dart';
import '../../features/rooms/screens/rooms_screen.dart';
import '../../shared/widgets/main_shell.dart';

class AppRouter {
  final AuthState authState;

  AppRouter(this.authState);

  GoRouter get router => GoRouter(
        initialLocation: '/',
        redirect: (context, state) {
          final isAuth = authState is AuthAuthenticated;
          final isLoading = authState is AuthInitial || authState is AuthLoading;
          final onAuthRoute = state.matchedLocation.startsWith('/login') ||
              state.matchedLocation.startsWith('/register');

          if (isLoading) return '/loading';
          if (!isAuth && !onAuthRoute) return '/login';
          if (isAuth && onAuthRoute) return '/';
          return null;
        },
        routes: [
          GoRoute(
            path: '/loading',
            builder: (_, __) => const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            ),
          ),
          GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
          GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
          ShellRoute(
            builder: (ctx, state, child) => MainShell(child: child),
            routes: [
              GoRoute(path: '/', builder: (_, __) => const SwipeScreen()),
              GoRoute(path: '/matches', builder: (_, __) => const MatchesScreen()),
              GoRoute(
                path: '/chat/:matchId',
                builder: (_, state) =>
                    ChatScreen(matchId: state.pathParameters['matchId']!),
              ),
              GoRoute(path: '/rooms', builder: (_, __) => const RoomsScreen()),
              GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
              GoRoute(
                path: '/profile/edit',
                builder: (_, __) => const EditProfileScreen(),
              ),
            ],
          ),
        ],
      );
}
