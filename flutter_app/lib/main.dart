import 'dart:async';
import 'dart:convert';

import 'package:audio_service/audio_service.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:home_widget/home_widget.dart';
import 'package:http/http.dart' as http;
import 'package:just_audio/just_audio.dart';
import 'package:rxdart/rxdart.dart';
import 'package:youtube_explode_dart/youtube_explode_dart.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final audioHandler = await AudioService.init(
    builder: () => DinletiyoAudioHandler(),
    config: const AudioServiceConfig(
      androidNotificationChannelId: 'com.dinletiyo.app.playback',
      androidNotificationChannelName: 'Dinletiyo',
      androidNotificationOngoing: true,
      androidStopForegroundOnPause: false,
    ),
  );

  runApp(DinletiyoApp(audioHandler: audioHandler));
}

class DinletiyoApp extends StatelessWidget {
  const DinletiyoApp({super.key, required this.audioHandler});
  final AudioHandler audioHandler;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Dinletiyo',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1DB954),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: HomeScreen(audioHandler: audioHandler),
    );
  }
}

class VideoItem {
  VideoItem({
    required this.id,
    required this.title,
    required this.thumbnail,
    this.duration,
    this.channelTitle,
  });

  final String id;
  final String title;
  final String thumbnail;
  final String? duration;
  final String? channelTitle;

  String get artist => channelTitle?.trim().isNotEmpty == true ? channelTitle!.trim() : 'YouTube';
}

class DinletiyoApi {
  DinletiyoApi({required this.baseUrl});
  final String baseUrl;

  Future<List<VideoItem>> search(String query) async {
    final uri = Uri.parse('$baseUrl/api/youtube-scrape?q=${Uri.encodeQueryComponent(query)}');
    final res = await http.get(uri);
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Arama hatası: HTTP ${res.statusCode}');
    }
    final decoded = jsonDecode(res.body) as Map<String, dynamic>;
    final raw = (decoded['videos'] as List<dynamic>? ?? const []);
    return raw
        .whereType<Map>()
        .map((m) => VideoItem(
              id: (m['id'] ?? '').toString(),
              title: (m['title'] ?? '').toString(),
              thumbnail: (m['thumbnail'] ?? '').toString(),
              duration: m['duration']?.toString(),
              channelTitle: m['channelTitle']?.toString(),
            ))
        .where((v) => v.id.isNotEmpty && v.title.isNotEmpty)
        .toList(growable: false);
  }

  Future<List<VideoItem>> top10() async {
    final uri = Uri.parse('$baseUrl/api/youtube/top10');
    final res = await http.get(uri);
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Top10 hatası: HTTP ${res.statusCode}');
    }
    final decoded = jsonDecode(res.body) as Map<String, dynamic>;
    final raw = (decoded['videos'] as List<dynamic>? ?? const []);
    return raw
        .whereType<Map>()
        .map((m) => VideoItem(
              id: (m['id'] ?? '').toString(),
              title: (m['title'] ?? '').toString(),
              thumbnail: (m['thumbnail'] ?? '').toString(),
              duration: m['duration']?.toString(),
              channelTitle: m['channelTitle']?.toString(),
            ))
        .where((v) => v.id.isNotEmpty && v.title.isNotEmpty)
        .toList(growable: false);
  }
}

class DinletiyoAudioHandler extends BaseAudioHandler with QueueHandler, SeekHandler {
  DinletiyoAudioHandler() {
    _player.playbackEventStream.listen((event) {
      final playing = _player.playing;
      playbackState.add(playbackState.value.copyWith(
        controls: [
          MediaControl.skipToPrevious,
          playing ? MediaControl.pause : MediaControl.play,
          MediaControl.stop,
          MediaControl.skipToNext,
        ],
        systemActions: const {MediaAction.seek},
        androidCompactActionIndices: const [0, 1, 3],
        processingState: const {
          ProcessingState.idle: AudioProcessingState.idle,
          ProcessingState.loading: AudioProcessingState.loading,
          ProcessingState.buffering: AudioProcessingState.buffering,
          ProcessingState.ready: AudioProcessingState.ready,
          ProcessingState.completed: AudioProcessingState.completed,
        }[_player.processingState]!,
        playing: playing,
        updatePosition: _player.position,
        bufferedPosition: _player.bufferedPosition,
        speed: _player.speed,
        queueIndex: _player.currentIndex,
      ));
    });

    _player.currentIndexStream.listen((index) {
      final q = queue.value;
      if (index == null || index < 0 || index >= q.length) return;
      mediaItem.add(q[index]);
      _syncHomeWidget(q[index], playing: _player.playing);
    });
  }

  final AudioPlayer _player = AudioPlayer();
  final YoutubeExplode _yt = YoutubeExplode();

  Future<void> playVideo(VideoItem v) async {
    // YouTube audio stream URL çıkar
    final manifest = await _yt.videos.streamsClient.getManifest(v.id);
    final audioOnly = manifest.audioOnly;
    if (audioOnly.isEmpty) {
      throw Exception('Bu video için ses akışı bulunamadı.');
    }
    final best = audioOnly.withHighestBitrate();
    final url = best.url;

    final item = MediaItem(
      id: v.id,
      title: v.title,
      artist: v.artist,
      duration: null,
      artUri: Uri.tryParse(v.thumbnail),
      extras: {
        'source': 'youtube',
        'streamUrl': url.toString(),
      },
    );

    queue.add([item]);
    mediaItem.add(item);
    await _player.setAudioSource(AudioSource.uri(url, tag: item));
    await _player.play();
    await _syncHomeWidget(item, playing: true);
  }

  Future<void> _syncHomeWidget(MediaItem item, {required bool playing}) async {
    // Android widget için
    await HomeWidget.saveWidgetData('title', item.title);
    await HomeWidget.saveWidgetData('artist', item.artist ?? '');
    await HomeWidget.saveWidgetData('playing', playing);
    if (item.artUri != null) {
      await HomeWidget.saveWidgetData('artUri', item.artUri.toString());
    }
    await HomeWidget.updateWidget(
      name: 'DinletiyoWidgetProvider',
      androidName: 'DinletiyoWidgetProvider',
    );
  }

  @override
  Future<void> play() => _player.play();

  @override
  Future<void> pause() async {
    await _player.pause();
    final item = mediaItem.value;
    if (item != null) await _syncHomeWidget(item, playing: false);
  }

  @override
  Future<void> stop() async {
    await _player.stop();
    await _player.seek(Duration.zero);
    final item = mediaItem.value;
    if (item != null) await _syncHomeWidget(item, playing: false);
    return super.stop();
  }

  @override
  Future<void> seek(Duration position) => _player.seek(position);

  @override
  Future<void> skipToNext() async {
    if (_player.hasNext) await _player.seekToNext();
  }

  @override
  Future<void> skipToPrevious() async {
    if (_player.hasPrevious) await _player.seekToPrevious();
  }

  @override
  void dispose() {
    _player.dispose();
    _yt.close();
    super.dispose();
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.audioHandler});
  final AudioHandler audioHandler;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  static const _baseUrl = 'https://dinletiyo.com';
  late final DinletiyoApi _api = DinletiyoApi(baseUrl: _baseUrl);
  final TextEditingController _controller = TextEditingController();

  List<VideoItem> _items = const [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadTop();
  }

  Future<void> _loadTop() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final items = await _api.top10();
      setState(() {
        _items = items;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _search() async {
    final q = _controller.text.trim();
    if (q.isEmpty) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final items = await _api.search(q);
      setState(() {
        _items = items;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      setState(() => _loading = false);
    }
  }

  DinletiyoAudioHandler get _handler => widget.audioHandler as DinletiyoAudioHandler;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dinletiyo'),
        actions: [
          IconButton(
            onPressed: _loadTop,
            icon: const Icon(Icons.refresh),
            tooltip: 'Yenile',
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    textInputAction: TextInputAction.search,
                    onSubmitted: (_) => _search(),
                    decoration: const InputDecoration(
                      hintText: 'Şarkı / sanatçı ara (YouTube)',
                      border: OutlineInputBorder(),
                      isDense: true,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                FilledButton(
                  onPressed: _search,
                  child: const Text('Ara'),
                ),
              ],
            ),
          ),
          if (_loading)
            const Expanded(child: Center(child: CircularProgressIndicator()))
          else if (_error != null)
            Expanded(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text(_error!, textAlign: TextAlign.center),
                ),
              ),
            )
          else
            Expanded(
              child: ListView.separated(
                itemCount: _items.length,
                separatorBuilder: (_, __) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final v = _items[index];
                  return ListTile(
                    leading: ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: CachedNetworkImage(
                        imageUrl: v.thumbnail,
                        width: 56,
                        height: 56,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => Container(
                          width: 56,
                          height: 56,
                          color: Colors.white10,
                          child: const Icon(Icons.music_note),
                        ),
                      ),
                    ),
                    title: Text(v.title, maxLines: 2, overflow: TextOverflow.ellipsis),
                    subtitle: Text(
                      [
                        if (v.channelTitle != null) v.channelTitle!,
                        if (v.duration != null) v.duration!,
                      ].where((s) => s.trim().isNotEmpty).join(' • '),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    trailing: const Icon(Icons.play_arrow),
                    onTap: () async {
                      try {
                        await _handler.playVideo(v);
                      } catch (e) {
                        if (!context.mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Çalma hatası: $e')),
                        );
                      }
                    },
                  );
                },
              ),
            ),
          NowPlayingBar(audioHandler: widget.audioHandler),
        ],
      ),
    );
  }
}

class NowPlayingBar extends StatelessWidget {
  const NowPlayingBar({super.key, required this.audioHandler});
  final AudioHandler audioHandler;

  Stream<Duration> get _positionStream => AudioService.position;

  Stream<_NowPlayingState> get _state => Rx.combineLatest3<MediaItem?, PlaybackState, Duration, _NowPlayingState>(
        audioHandler.mediaItem,
        audioHandler.playbackState,
        _positionStream,
        (item, state, pos) => _NowPlayingState(item: item, state: state, position: pos),
      );

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<_NowPlayingState>(
      stream: _state,
      builder: (context, snapshot) {
        final data = snapshot.data;
        final item = data?.item;
        final playing = data?.state.playing ?? false;
        if (item == null) return const SizedBox.shrink();

        final title = item.title;
        final artist = item.artist ?? '';

        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: Colors.black,
            border: Border(top: BorderSide(color: Colors.white.withOpacity(0.08))),
          ),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: item.artUri == null
                    ? Container(
                        width: 44,
                        height: 44,
                        color: Colors.white10,
                        child: const Icon(Icons.music_note),
                      )
                    : CachedNetworkImage(
                        imageUrl: item.artUri.toString(),
                        width: 44,
                        height: 44,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => Container(
                          width: 44,
                          height: 44,
                          color: Colors.white10,
                          child: const Icon(Icons.music_note),
                        ),
                      ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(title, maxLines: 1, overflow: TextOverflow.ellipsis),
                    if (artist.isNotEmpty)
                      Text(
                        artist,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: Colors.white70, fontSize: 12),
                      ),
                  ],
                ),
              ),
              IconButton(
                onPressed: playing ? audioHandler.pause : audioHandler.play,
                icon: Icon(playing ? Icons.pause : Icons.play_arrow),
              ),
              IconButton(
                onPressed: audioHandler.stop,
                icon: const Icon(Icons.stop),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _NowPlayingState {
  _NowPlayingState({required this.item, required this.state, required this.position});
  final MediaItem? item;
  final PlaybackState state;
  final Duration position;
}

