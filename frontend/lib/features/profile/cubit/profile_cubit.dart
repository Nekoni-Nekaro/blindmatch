import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../../core/api/api_client.dart';

abstract class ProfileState extends Equatable {
  const ProfileState();
  @override
  List<Object?> get props => [];
}

class ProfileInitial extends ProfileState {}
class ProfileLoading extends ProfileState {}
class ProfileLoaded extends ProfileState {
  final Map<String, dynamic> profile;
  const ProfileLoaded(this.profile);
  @override
  List<Object?> get props => [profile];
}
class ProfileError extends ProfileState {
  final String message;
  const ProfileError(this.message);
  @override
  List<Object?> get props => [message];
}

class ProfileCubit extends Cubit<ProfileState> {
  final ApiClient _api;

  ProfileCubit(this._api) : super(ProfileInitial());

  Future<void> load() async {
    emit(ProfileLoading());
    try {
      final data = await _api.getMyProfile();
      emit(ProfileLoaded(data));
    } catch (e) {
      emit(ProfileError(e.toString()));
    }
  }

  Future<void> update(Map<String, dynamic> data) async {
    try {
      final updated = await _api.updateProfile(data);
      emit(ProfileLoaded(updated));
    } catch (e) {
      emit(ProfileError(e.toString()));
    }
  }
}
