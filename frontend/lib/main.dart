import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:path_provider/path_provider.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';

import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/api/api_client.dart';
import 'core/auth/auth_cubit.dart';
import 'features/profile/cubit/profile_cubit.dart';
import 'features/matches/cubit/matches_cubit.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final storage = await HydratedStorage.build(
    storageDirectory: await getApplicationDocumentsDirectory(),
  );
  HydratedBloc.storage = storage;

  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const BlindMatchApp());
}

class BlindMatchApp extends StatelessWidget {
  const BlindMatchApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider(create: (_) => ApiClient()),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider(
            create: (ctx) => AuthCubit(ctx.read<ApiClient>())..checkAuth(),
          ),
          BlocProvider(
            create: (ctx) => ProfileCubit(ctx.read<ApiClient>()),
          ),
          BlocProvider(
            create: (ctx) => MatchesCubit(ctx.read<ApiClient>()),
          ),
        ],
        child: BlocBuilder<AuthCubit, AuthState>(
          builder: (context, authState) {
            final router = AppRouter(authState).router;
            return MaterialApp.router(
              title: 'BlindMatch',
              debugShowCheckedModeBanner: false,
              theme: AppTheme.light,
              darkTheme: AppTheme.dark,
              themeMode: ThemeMode.system,
              routerConfig: router,
            );
          },
        ),
      ),
    );
  }
}
