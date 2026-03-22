import 'package:flutter/material.dart';
import 'package:stitch_mobile/theme/app_theme.dart';
import 'package:stitch_mobile/models/project.dart';
import 'package:stitch_mobile/services/api_service.dart';


class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ApiService _apiService = ApiService();
  late Future<List<Project>> _projectsFuture;
  final TextEditingController _promptController = TextEditingController();
  bool _isGenerating = false;

  final List<Map<String, dynamic>> _categories = [
    {
      'title': 'UI/UX Design',
      'subtitle': 'Design',
      'color': AppTheme.oceanBlue,
      'gradient': [const Color(0xFFA3BCF9), const Color(0xFF7D9EF6)],
    },
    {
      'title': 'Advanced .Net',
      'subtitle': 'Programming',
      'color': AppTheme.accentOrange,
      'gradient': [const Color(0xFFFFD460), const Color(0xFFFFB347)],
    },
    {
      'title': 'Digital Art',
      'subtitle': 'Design',
      'color': AppTheme.accentMint,
      'gradient': [const Color(0xFFB5EAD7), const Color(0xFF98D8C1)],
    },
    {
      'title': 'Copywriting',
      'subtitle': 'Information',
      'color': AppTheme.accentPink,
      'gradient': [const Color(0xFFFF9AA2), const Color(0xFFFF7B89)],
    },
  ];

  @override
  void initState() {
    super.initState();
    _projectsFuture = _apiService.getProjects();
  }

  @override
  void dispose() {
    _promptController.dispose();
    super.dispose();
  }

  Future<void> _handleGenerate() async {
    final prompt = _promptController.text.trim();
    if (prompt.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a design vision')),
      );
      return;
    }

    setState(() => _isGenerating = true);
    
    try {
      final workflowId = await _apiService.startDesign(prompt);
      if (workflowId != null) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Design workflow started: $workflowId'),
            backgroundColor: AppTheme.oceanBlue,
          ),
        );
        _promptController.clear();
        Future.delayed(const Duration(seconds: 2), () {
          if (mounted) {
            setState(() {
              _projectsFuture = _apiService.getProjects();
            });
          }
        });
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      if (mounted) {
        setState(() => _isGenerating = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 60),
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        const CircleAvatar(
                          radius: 24,
                          backgroundImage: AssetImage('assets/images/ro.jpeg'),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Welcome back', style: TextStyle(fontSize: 12, color: Colors.grey)),
                              Text('Rosius Ndimofor', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16), maxLines: 1, overflow: TextOverflow.ellipsis),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceDark,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white.withOpacity(0.08)),
                    ),
                    child: const Icon(Icons.search, size: 20),
                  ),
                ],
              ),
              const SizedBox(height: 32),
              
              // 1. Headline & Description
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  RichText(
                    text: TextSpan(
                      style: Theme.of(context).textTheme.displayLarge?.copyWith(
                            fontSize: 36,
                            height: 1.1,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                      children: [
                        const TextSpan(text: 'What are we\n'),
                        WidgetSpan(
                          child: ShaderMask(
                            shaderCallback: (bounds) => const LinearGradient(
                              colors: [Color(0xFFA78BFA), Color(0xFF6366F1), Color(0xFF3B82F6)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ).createShader(bounds),
                            child: Text(
                              'creating today?',
                              style: Theme.of(context).textTheme.displayLarge?.copyWith(
                                    fontSize: 36,
                                    height: 1.1,
                                    fontWeight: FontWeight.w800,
                                    color: Colors.white,
                                  ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Describe your vision and let the curator transform your ideas into refined design concepts.',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.6),
                      fontSize: 16,
                      height: 1.5,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),
              
              // 2. Prompt Input Card
              _buildPromptInput(),
              const SizedBox(height: 16),
              
              // 3. Quick Action Chips
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _buildQuickActionChip('Modern Bento Layout'),
                  _buildQuickActionChip('Neo-Brutalism UI'),
                  _buildQuickActionChip('Glassmorphism Profile'),
                  _buildQuickActionChip('E-commerce Detail Page'),
                ],
              ),
              const SizedBox(height: 48),
              
              // Recent Concepts
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Recent Concepts', style: Theme.of(context).textTheme.headlineMedium),
                  Text('See All', style: Theme.of(context).textTheme.titleSmall?.copyWith(color: AppTheme.oceanBlue)),
                ],
              ),
              const SizedBox(height: 20),
              
              SizedBox(
                height: 200,
                child: FutureBuilder<List<Project>>(
                  future: _projectsFuture,
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const Center(child: CircularProgressIndicator());
                    }
                    if (!snapshot.hasData || snapshot.data!.isEmpty) {
                      return const Center(child: Text('No projects yet'));
                    }
                    final projects = snapshot.data!;
                    return ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: projects.length,
                      itemBuilder: (context, index) {
                        final p = projects[index];
                        return _buildSmallProjectCard(p);
                      },
                    );
                  },
                ),
              ),
              
              const SizedBox(height: 48),
              
              // Explore Fields Headline
              Text(
                'Let’s explore\nnew fields',
                style: Theme.of(context).textTheme.displayLarge?.copyWith(
                      height: 1.05,
                      fontSize: 42,
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const SizedBox(height: 24),
              
              // Category Chips
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildChip('All', isSelected: true),
                    _buildChip('Programming'),
                    _buildChip('Design'),
                    _buildChip('Information'),
                    _buildChip('Marketing'),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              
              // Bento Grid
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 0.95,
                ),
                itemCount: _categories.length,
                itemBuilder: (context, index) {
                  final cat = _categories[index];
                  return _buildCategoryCard(cat);
                },
              ),
              
              const SizedBox(height: 120),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPromptInput() {
    return Container(
      padding: const EdgeInsets.all(2), // Gradient border effect
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.white.withOpacity(0.1), Colors.white.withOpacity(0.01)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Container(
        padding: const EdgeInsets.only(top: 24, left: 24, right: 24, bottom: 12),
        decoration: BoxDecoration(
          color: const Color(0xFF1A1A1A),
          borderRadius: BorderRadius.circular(22),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              controller: _promptController,
              maxLines: 4,
              style: const TextStyle(color: Colors.white, fontSize: 18, height: 1.4),
              decoration: InputDecoration(
                hintText: "A luxury dashboard for a dark\nmode watch gallery...",
                hintStyle: TextStyle(color: Colors.white.withOpacity(0.2), fontSize: 18),
                border: InputBorder.none,
                contentPadding: EdgeInsets.zero,
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  flex: 2,
                  child: Row(
                    children: [
                      Flexible(
                        flex: 1,
                        child: _buildInputActionButton(Icons.attach_file_rounded, 'REFERENCE'),
                      ),
                      const SizedBox(width: 8),
                      Flexible(
                        flex: 1,
                        child: _buildInputActionButton(Icons.auto_awesome_rounded, 'IMPROVE'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Flexible(
                  flex: 1,
                  child: GestureDetector(
                    onTap: _isGenerating ? null : _handleGenerate,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF8B5CF6), Color(0xFF6366F1)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          if (!_isGenerating)
                            BoxShadow(
                              color: const Color(0xFF8B5CF6).withOpacity(0.3),
                              blurRadius: 15,
                              offset: const Offset(0, 4),
                            ),
                        ],
                      ),
                      child: Center(
                        child: _isGenerating
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const FittedBox(
                              fit: BoxFit.scaleDown,
                              child: Text(
                                'GENERATE',
                                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, letterSpacing: 0.8, fontSize: 13),
                              ),
                            ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputActionButton(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8), // Reduced from 12
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.08),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.white.withOpacity(0.6)),
          const SizedBox(width: 6),
          Flexible(
            child: FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(
                label,
                style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.5),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionChip(String label) {
    return GestureDetector(
      onTap: () => setState(() => _promptController.text = label),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.03),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withOpacity(0.06)),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: Colors.white.withOpacity(0.5),
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildChip(String label, {bool isSelected = false}) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      decoration: BoxDecoration(
        color: isSelected ? Colors.white : AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: isSelected ? Colors.black : Colors.white.withOpacity(0.6),
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildCategoryCard(Map<String, dynamic> cat) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: cat['gradient'],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(AppTheme.cardRadius),
      ),
      padding: const EdgeInsets.all(20),
      child: Stack(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  cat['subtitle'],
                  style: const TextStyle(fontSize: 10, color: Colors.black54, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                cat['title'],
                style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.w800, fontSize: 16),
              ),
            ],
          ),
          Positioned(
            top: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.north_east, size: 16, color: Colors.black87),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSmallProjectCard(Project project) {
    return Container(
      width: 160,
      margin: const EdgeInsets.only(right: 16),
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: project.thumbnailUrl.isNotEmpty
              ? Image.network(project.thumbnailUrl, fit: BoxFit.cover, width: double.infinity)
              : Container(color: Colors.grey.withOpacity(0.1), child: const Center(child: Icon(Icons.image))),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Text(
              project.title,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
