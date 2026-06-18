import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../api/api_client.dart';

// ── State ─────────────────────────────────────────────────────────
abstract class AuthState extends Equatable {
  const AuthState();
  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {}
class AuthLoading extends AuthState {}
class AuthAuthenticated extends AuthState {
  final Map<String, dynamic> user;
  const AuthAuthenticated(this.user);
  @override
  List<Object?> get props => [user];
}
class AuthUnauthenticated extends AuthState {}
class AuthError extends AuthState {
  final String message;
  const AuthError(this.message);
  @override
  List<Object?> get props => [message];
}

// ── Cubit ─────────────────────────────────────────────────────────
class AuthCubit extends Cubit<AuthState> {
  final ApiClient _api;

  AuthCubit(this._api) : super(AuthInitial());

  Future<void> checkAuth() async {
    final token = await _api.getToken();
    if (token == null) {
      emit(AuthUnauthenticated());
      return;
    }
    try {
      final user = await _api.getMe();
      emit(AuthAuthenticated(user));
    } catch (_) {
      emit(AuthUnauthenticated());
    }
  }

  Future<void> login(String email, String password) async {
    emit(AuthLoading());
    try {
      await _api.login(email, password);
      final user = await _api.getMe();
      emit(AuthAuthenticated(user));
    } catch (e) {
      emit(AuthError(_parseError(e)));
    }
  }

  Future<void> register(String email, String password) async {
    emit(AuthLoading());
    try {
      await _api.register(email, password);
      emit(AuthUnauthenticated()); // Redirect to login
    } catch (e) {
      emit(AuthError(_parseError(e)));
    }
  }

  Future<void> logout() async {
    await _api.logout();
    emit(AuthUnauthenticated());
  }

  String _parseError(dynamic e) {
    if (e.toString().contains('409')) return 'Email already registered';
    if (e.toString().contains('401')) return 'Invalid email or password';
    if (e.toString().contains('connection')) return 'No internet connection';
    return 'Something went wrong. Please try again.';
  }
}
