import { SlashCommandBuilder } from 'discord.js';
import {
  leaveMusic,
  listMusicTracks,
  playMusic,
  stopMusic,
} from '../services/music.js';

export const data = new SlashCommandBuilder()
  .setName('music')
  .setDescription('Play local royalty-free music in your voice channel.')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('list')
      .setDescription('Show available local music tracks.'),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('play')
      .setDescription('Play a local music track.')
      .addStringOption((option) =>
        option
          .setName('track')
          .setDescription('Track file name without extension, for example chill.')
          .setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('stop')
      .setDescription('Stop the current track.'),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('leave')
      .setDescription('Stop music and leave the voice channel.'),
  );

export async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'list') {
    await listTracks(interaction);
    return;
  }

  if (subcommand === 'play') {
    await playTrack(interaction);
    return;
  }

  if (subcommand === 'stop') {
    stopMusic(interaction.guildId);
    await interaction.reply('Music stopped.');
    return;
  }

  if (subcommand === 'leave') {
    leaveMusic(interaction.guildId);
    await interaction.reply('Music stopped and I left the voice channel.');
  }
}

async function listTracks(interaction) {
  const tracks = listMusicTracks();

  if (!tracks.length) {
    await interaction.reply({
      content:
        'No music files found. Add royalty-free .mp3, .ogg, .wav, .flac, or .m4a files to assets/music.',
      ephemeral: true,
    });
    return;
  }

  await interaction.reply({
    content: tracks.map((track) => `- ${track.id} (${track.fileName})`).join('\n'),
    ephemeral: true,
  });
}

async function playTrack(interaction) {
  if (!interaction.guild || !interaction.guildId) {
    await interaction.reply({
      content: 'Music commands can only be used in a server.',
      ephemeral: true,
    });
    return;
  }

  const voiceChannel = interaction.member?.voice?.channel;

  if (!voiceChannel) {
    await interaction.reply({
      content: 'Join a voice channel first, then use /music play.',
      ephemeral: true,
    });
    return;
  }

  const trackId = interaction.options.getString('track', true);

  let track;

  try {
    track = await playMusic({
      guildId: interaction.guildId,
      trackId,
      voiceAdapterCreator: interaction.guild.voiceAdapterCreator,
      voiceChannel,
    });
  } catch (error) {
    if (error.code === 'MUSIC_TRACK_NOT_FOUND') {
      await interaction.reply({
        content: `Track not found: ${trackId}. Use /music list to see available tracks.`,
        ephemeral: true,
      });
      return;
    }

    throw error;
  }

  await interaction.reply(`Playing: ${track.id}`);
}
