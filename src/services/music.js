import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  getVoiceConnection,
  joinVoiceChannel,
  NoSubscriberBehavior,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import ffmpegPath from 'ffmpeg-static';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MUSIC_DIR = path.resolve(__dirname, '../../assets/music');
const SUPPORTED_EXTENSIONS = new Set(['.mp3', '.ogg', '.wav', '.flac', '.m4a']);
const players = new Map();

if (ffmpegPath) {
  process.env.FFMPEG_PATH = ffmpegPath;
}

export function listMusicTracks() {
  if (!existsSync(MUSIC_DIR)) {
    return [];
  }

  return readdirSync(MUSIC_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) => SUPPORTED_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
    .map((fileName) => ({
      fileName,
      filePath: path.join(MUSIC_DIR, fileName),
      id: path.basename(fileName, path.extname(fileName)).toLowerCase(),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export async function playMusic({
  guildId,
  trackId,
  voiceAdapterCreator,
  voiceChannel,
}) {
  const track = findTrack(trackId);

  if (!track) {
    const error = new Error(`Music track not found: ${trackId}`);
    error.code = 'MUSIC_TRACK_NOT_FOUND';
    throw error;
  }

  const connection =
    getVoiceConnection(guildId) ||
    joinVoiceChannel({
      adapterCreator: voiceAdapterCreator,
      channelId: voiceChannel.id,
      guildId,
      selfDeaf: true,
    });

  const player = getOrCreatePlayer(guildId);
  const resource = createAudioResource(track.filePath);

  connection.subscribe(player);
  player.play(resource);

  await entersState(connection, VoiceConnectionStatus.Ready, 15_000);

  return track;
}

export function stopMusic(guildId) {
  const player = players.get(guildId);

  if (player) {
    player.stop(true);
  }
}

export function leaveMusic(guildId) {
  stopMusic(guildId);
  players.delete(guildId);

  const connection = getVoiceConnection(guildId);

  if (connection) {
    connection.destroy();
  }
}

function findTrack(trackId) {
  const normalizedTrackId = trackId.trim().toLowerCase();

  return listMusicTracks().find(
    (track) =>
      track.id === normalizedTrackId ||
      track.fileName.toLowerCase() === normalizedTrackId,
  );
}

function getOrCreatePlayer(guildId) {
  const existingPlayer = players.get(guildId);

  if (existingPlayer) {
    return existingPlayer;
  }

  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });

  player.on(AudioPlayerStatus.Idle, () => {
    player.stop();
  });

  player.on('error', (error) => {
    console.error('Music player error:', error);
  });

  players.set(guildId, player);
  return player;
}
