import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../core/auth/auth_cubit.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _obscure = true;
  bool _agreed = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  void _submit(BuildContext context) {
    if (!_formKey.currentState!.validate()) return;
    if (!_agreed) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please agree to Terms & Privacy Policy')),
      );
      return;
    }
    context.read<AuthCubit>().register(_emailCtrl.text.trim(), _passCtrl.text);
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(leading: const BackButton()),
      body: BlocListener<AuthCubit, AuthState>(
        listener: (ctx, state) {
          if (state is AuthUnauthenticated) {
            ScaffoldMessenger.of(ctx).showSnackBar(
              const SnackBar(
                content: Text('Account created! Please sign in.'),
                backgroundColor: Colors.green,
              ),
            );
            context.go('/login');
          }
          if (state is AuthError) {
            ScaffoldMessenger.of(ctx).showSnackBar(
              SnackBar(content: Text(state.message), backgroundColor: cs.error),
            );
          }
        },
        child: BlocBuilder<AuthCubit, AuthState>(
          builder: (ctx, state) {
            final loading = state is AuthLoading;
            return SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Create account',
                        style: Theme.of(context).textTheme.displayMedium,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Meet people who think like you',
                        style: TextStyle(color: cs.onSurfaceVariant),
                      ),
                      const SizedBox(height: 32),
                      TextFormField(
                        controller: _emailCtrl,
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        decoration: const InputDecoration(
                          labelText: 'Email',
                          prefixIcon: Icon(Icons.email_outlined),
                        ),
                        validator: (v) {
                          if (v == null || v.isEmpty) return 'Enter your email';
                          if (!v.contains('@')) return 'Invalid email';
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _passCtrl,
                        obscureText: _obscure,
                        textInputAction: TextInputAction.next,
                        decoration: InputDecoration(
                          labelText: 'Password',
                          prefixIcon: const Icon(Icons.lock_outlined),
                          suffixIcon: IconButton(
                            icon: Icon(_obscure
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined),
                            onPressed: () => setState(() => _obscure = !_obscure),
                          ),
                        ),
                        validator: (v) {
                          if (v == null || v.length < 8) {
                            return 'Password must be at least 8 characters';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _confirmCtrl,
                        obscureText: _obscure,
                        textInputAction: TextInputAction.done,
                        decoration: const InputDecoration(
                          labelText: 'Confirm password',
                          prefixIcon: Icon(Icons.lock_outlined),
                        ),
                        validator: (v) {
                          if (v != _passCtrl.text) return 'Passwords do not match';
                          return null;
                        },
                      ),
                      const SizedBox(height: 20),
                      Row(
                        children: [
                          Checkbox(
                            value: _agreed,
                            onChanged: (v) => setState(() => _agreed = v ?? false),
                          ),
                          Expanded(
                            child: Text.rich(
                              TextSpan(
                                text: 'I agree to the ',
                                children: [
                                  TextSpan(
                                    text: 'Terms of Service',
                                    style: TextStyle(color: cs.primary),
                                  ),
                                  const TextSpan(text: ' and '),
                                  TextSpan(
                                    text: 'Privacy Policy',
                                    style: TextStyle(color: cs.primary),
                                  ),
                                ],
                              ),
                              style: TextStyle(color: cs.onSurfaceVariant, fontSize: 13),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: loading ? null : () => _submit(context),
                        child: loading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Text('Create Account'),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
