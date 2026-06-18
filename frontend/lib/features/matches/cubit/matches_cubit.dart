import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../../core/api/api_client.dart';

// ── State ─────────────────────────────────────────────────────────
abstract class MatchesState extends Equatable {
  const MatchesState();
  @override
  List<Object?> get props => [];
}

class MatchesInitial extends MatchesState {}
class MatchesLoading extends MatchesState {}
class MatchesLoaded extends MatchesState {
  final List<Map<String, dynamic>> matches;
  const MatchesLoaded(this.matches);
  @override
  List<Object?> get props => [matches];
}
class MatchesError extends MatchesState {
  final String message;
  const MatchesError(this.message);
  @override
  List<Object?> get props => [message];
}

// ── Cubit ─────────────────────────────────────────────────────────
class MatchesCubit extends Cubit<MatchesState> {
  final ApiClient _api;

  MatchesCubit(this._api) : super(MatchesInitial());

  Future<void> load() async {
    emit(MatchesLoading());
    try {
      final list = await _api.getMatches();
      emit(MatchesLoaded(List<Map<String, dynamic>>.from(list)));
    } catch (e) {
      emit(MatchesError(e.toString()));
    }
  }

  Future<void> requestReveal(String matchId) async {
    try {
      await _api.requestReveal(matchId);
      await load();
    } catch (_) {}
  }
}
