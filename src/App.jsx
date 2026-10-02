import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './App.css'
import Dashboard, { PublicStore } from './Dashboard.jsx'
import { getBundleDiscount, hostingPlans } from './plans.js'
import { getAppPathname, siteHref } from './sitePath.js'
import axiomCloudWordmark from './assets/brand/axiom-cloud-wordmark.png'
import axiomHostingWordmark from './assets/brand/axiom-hosting-wordmark.png'

const discordInvite = 'https://discord.gg/VZG744mFDy'

const homepagePlans = hostingPlans.slice(0, 4)

const billingCycles = [
  { id: 'weekly', label: 'Weekly', multiplier: 0.25, suffix: '/week' },
  { id: 'monthly', label: 'Monthly', multiplier: 1, suffix: '/month' },
  { id: 'quarterly', label: 'Quarterly', multiplier: 2.79, suffix: '/quarter', saving: 'Save 7%' },
  { id: 'yearly', label: 'Yearly', multiplier: 10.2, suffix: '/year', saving: 'Save 15%' },
]

const serverCommandGroups = [
  {
    title: 'Automation commands',
    description: 'Use automation commands for scheduled actions, shortcuts, and repetitive administration tasks.',
    commands: [
      ['/restart <time>', 'Schedule a server restart.'],
      ['/shutdown <time>', 'Schedule a shutdown.'],
      ['/backup', 'Create a server or world backup.'],
      ['/backup schedule <time>', 'Automatically run backups on a schedule.'],
      ['/broadcast <message>', 'Send a server-wide announcement.'],
      ['/broadcast schedule <time> <message>', 'Schedule an announcement.'],
      ['/whitelist <on|off>', 'Enable or disable the whitelist.'],
      ['/maintenance <on|off>', 'Put the server into or take it out of maintenance mode.'],
      ['/command schedule <time> <command>', 'Run another server command later.'],
      ['/command repeat <interval> <command>', 'Repeatedly execute a command.'],
      ['/cleanup <entities|items|chunks>', 'Run an automated cleanup task.'],
      ['/status', 'Show uptime, TPS, memory, players, scheduled tasks, and upcoming restarts.'],
    ],
  },
  {
    title: 'Player management commands',
    description: 'Manage access, moderation, permissions, and player status.',
    commands: [
      ['/kick <player> [reason]', 'Remove a player from the server.'],
      ['/ban <player> [reason]', 'Permanently ban a player.'],
      ['/tempban <player> <duration> [reason]', 'Ban a player for a set period.'],
      ['/unban <player>', 'Remove a ban.'],
      ['/mute <player> [reason]', 'Prevent a player from chatting.'],
      ['/tempmute <player> <duration> [reason]', 'Temporarily mute a player.'],
      ['/unmute <player>', 'Remove a mute.'],
      ['/warn <player> <reason>', "Add a warning to a player's record."],
      ['/history <player>', 'View bans, kicks, mutes, and warnings.'],
      ['/info <player>', 'View basic player information and server stats.'],
      ['/tp <player> [target]', 'Teleport a player to another player or location.'],
      ['/freeze <player>', 'Temporarily prevent a player from moving.'],
    ],
  },
  {
    title: 'World and gameplay commands',
    description: 'Change game modes, weather, time, difficulty, gamerules, and world settings.',
    commands: [
      ['/gamemode <mode> [player]', "Change a player's game mode."],
      ['/difficulty <level>', "Change the world's difficulty."],
      ['/time set <time>', 'Change the current world time.'],
      ['/weather <type>', "Change the world's weather."],
      ['/gamerule <rule> <value>', 'Change a gameplay rule for the world.'],
      ['/tp <player> <location>', 'Teleport a player to a location.'],
      ['/spawnpoint [player] [location]', "Set a player's respawn point."],
      ['/setworldspawn [location]', "Set the world's default spawn location."],
      ['/locate <structure>', 'Find a structure, biome, or point of interest.'],
      ['/seed', "Display the world's seed."],
      ['/worldborder <option>', "View or change the world's border."],
      ['/kill <target>', 'Kill the specified player or entity.'],
    ],
  },
  {
    title: 'Navigation commands',
    description: 'Teleport players, save destinations, and move around the world faster.',
    commands: [
      ['/tp <player> <destination>', 'Teleport a player to another player or location.'],
      ['/tphere <player>', 'Teleport a player directly to you.'],
      ['/back', 'Return to your previous location.'],
      ['/home', 'Teleport to your saved home.'],
      ['/sethome <name>', 'Save your current location as a home.'],
      ['/delhome <name>', 'Delete one of your saved homes.'],
      ['/spawn', 'Teleport to the server spawn.'],
      ['/warp <name>', 'Teleport to a saved server warp.'],
      ['/setwarp <name>', 'Create a new server warp.'],
      ['/delwarp <name>', 'Delete an existing server warp.'],
      ['/tpa <player>', 'Request to teleport to another player.'],
      ['/tpaccept', "Accept another player's teleport request."],
    ],
  },
  {
    title: 'World border commands',
    description: 'Limit the map size and control how far players can explore.',
    commands: [
      ['/worldborder get', 'Show the current world border size.'],
      ['/worldborder set <distance>', 'Set the world border to a specific size.'],
      ['/worldborder set <distance> <time>', 'Gradually change the border size over time.'],
      ['/worldborder center <x> <z>', 'Change the center of the world border.'],
      ['/worldborder add <distance>', 'Increase or decrease the current border size.'],
      ['/worldborder add <distance> <time>', 'Gradually expand or shrink the border.'],
      ['/worldborder damage amount <damage>', 'Set the damage taken outside the border.'],
      ['/worldborder damage buffer <distance>', 'Set how far outside the border players can go before taking damage.'],
      ['/worldborder warning distance <distance>', 'Set when the border warning appears based on distance.'],
      ['/worldborder warning time <seconds>', 'Set when the border warning appears based on time.'],
      ['/worldborder set 1000', 'Example: create a 1,000-block-wide border.'],
      ['/worldborder set 500 60', 'Example: resize the border to 500 blocks over 60 seconds.'],
    ],
  },
]

const documentationGroups = [
  {
    label: 'Start here',
    items: [
      { slug: 'getting-started', title: 'Getting Started', summary: 'Choose what you want to do and open a short, focused guide for that task.', sections: [], guideCards: [
        { title: 'Find your server address', copy: 'Get the address, IP, and port needed to join.', href: '/documents/find-server-address' },
        { title: 'Add a plugin', copy: 'Install a plugin on a Paper or Purpur server.', href: '/documents/add-plugin' },
        { title: 'Remove a plugin', copy: 'Uninstall a plugin without losing data you may need.', href: '/documents/remove-plugin' },
        { title: 'Add a mod', copy: 'Install Fabric, Forge, or NeoForge mods correctly.', href: '/documents/installing-mods' },
        { title: 'Remove a mod', copy: 'Remove a mod while protecting your world.', href: '/documents/remove-mod' },
        { title: 'Update the server', copy: 'Change Minecraft or server-software versions safely.', href: '/documents/update-server' },
        { title: 'Set up backups', copy: 'Schedule daily backups and confirm they work.', href: '/documents/daily-backups' },
        { title: 'Transfer a world', copy: 'Move an existing Minecraft world to your server.', href: '/documents/world-transfer' },
      ] },
      { slug: 'world-transfer', title: 'World Transfer', summary: 'Move an existing Minecraft world into an Axiom server.', sections: [['Prepare the world', 'Stop the old server and create a complete archive of the world folder before uploading anything.'], ['Upload safely', 'Upload the archive through the file manager, extract it, and confirm the folder name matches the configured world name.'], ['Verify the move', 'Start the server and check player data, dimensions, inventories, and spawn before reopening it to everyone.']] },
      { slug: 'role-management', title: 'Role Setup and Management', summary: 'Give owners, administrators, moderators, and players the access they need without granting too much control.', sections: [
        ['Choose a role system', 'A small private server may only need Minecraft’s built-in operator access. Public servers should use a permissions plugin such as LuckPerms so staff can receive specific commands without gaining full control. Modded servers need a permissions mod made for their loader and Minecraft version.'],
        ['Manage operators', 'Operators can use powerful commands and make major server changes. Grant access from the console with op PlayerName and remove it with deop PlayerName. Only trusted owners or administrators should be operators. If someone needs one basic command, create a limited permissions role instead.'],
        ['Create staff roles', 'Start with a few clear groups such as Owner, Admin, Moderator, Helper, and Player. Give each group only the permissions needed for its job, then test the role with a non-owner account. This catches missing permissions and prevents accidental access to sensitive commands.'],
        ['Keep access secure', 'Limit billing, console, file, and backup access to the owner and trusted administrators. Remove former staff quickly, review permissions regularly, and use a unique account with a strong password for every panel user. Make a backup before changing a large permissions setup.'],
      ] },
    ],
  },
  {
    label: 'Server Setup',
    items: [
      { slug: 'server-logo', title: 'How to Change a Minecraft Server Logo', summary: 'Add or replace the small icon shown beside your server in the Minecraft multiplayer list.', sections: [
        ['What you need', 'Your logo must be a square PNG image. Minecraft Java Edition works best with these exact settings:', ['Size: 64 × 64 pixels.', 'File type: PNG.', 'File name: server-icon.png — use this exact spelling.']],
        ['Upload the logo', 'The icon belongs in the main server folder, not inside the world folder.', ['Stop the server.', 'Open the server control panel and choose File Manager.', 'Find the main folder that contains server.properties.', 'Upload server-icon.png to that folder. Replace the old file if asked.', 'Start the server again.']],
        ['If the logo does not change', 'Try these quick checks:', ['Make sure the image is exactly 64 × 64 pixels and is not a JPG or WebP file.', 'Check that the name is server-icon.png, with no spaces or extra file extension.', 'Restart Minecraft or remove and re-add the server in your multiplayer list to clear the old cached icon.']],
      ] },
      { slug: 'change-server-location', title: 'How to Change Server Location', summary: 'Choose the best available region for your players and safely request a server move.', sections: [
        ['Choose the best location', 'Use the location closest to most of your players—not only the server owner. A closer region usually means lower ping, but internet routes can change the result.', ['Ashburn or US East: usually best for players in eastern North America.', 'US West: usually best for players in western North America.', 'Europe West: usually best for Europe and may be the best available choice for players in Africa.', 'Asia or Oceania: choose the available region with the lowest tested ping. If no nearby region is listed, ask support whether another location is available.']],
        ['Before you move', 'A location change may cause downtime and may give the server a new IP address or port.', ['Create a full backup of the server.', 'Tell players when the server will be offline.', 'Save any DNS, database, or plugin connection settings that may need to be updated.']],
        ['Change the location', 'Follow these steps when your preferred region is available:', ['Open the Axiom dashboard and select your server.', 'Open the location or region setting.', 'Choose the new location and confirm the move.', 'If there is no location setting, contact support. Include your server name, current location, and preferred location.', 'Wait for the move to finish before starting or editing the server.']],
        ['Check the server after the move', 'Make sure everything still works before reopening it to players.', ['Confirm whether the server IP address or port changed.', 'Update your domain or SRV record and any plugins that use the old address.', 'Start the server and check the world, plugins, and player data.', 'Ask players in different areas to test their ping.']],
      ] },
      { slug: 'find-server-address', title: 'How to Find Your Server Address', summary: 'Find the subdomain, IP address, and port players need to join your Minecraft server.', sections: [
        ['Use the server address first', 'The easiest option is the server subdomain shown below the server name on your dashboard.', ['Open the Axiom dashboard and select your server.', 'Find the address below the server name.', 'Use the copy button to copy the full address.', 'Paste it into Minecraft under Multiplayer → Add Server or Direct Connection.']],
        ['Find the IP address and port', 'Use the direct IP if the normal server address does not work.', ['Open your server in the dashboard.', 'Go to Resources → Network.', 'Find the Primary IP and port.', 'Join with both parts in this format: IP:port. Example: 192.0.2.10:25565.']],
        ['Which address should you share?', 'Share the dashboard subdomain with players whenever possible. A raw IP address can change, while the subdomain is easier to remember and can point to the updated server.', ['If the subdomain fails but the direct IP works, copy the exact Minecraft error message.', 'Check the server console to see whether the connection attempt appears.', 'Confirm that the server is online and that the player is using the correct Minecraft version.', 'Send the error message and your test results to support if the problem continues.']],
      ] },
      { slug: 'update-server', title: 'How to Update Your Minecraft Server', summary: 'Change Minecraft or server-software versions without risking your world.', sections: [
        ['Check compatibility', 'Before updating, confirm that your plugins, mods, mod loader, and Java version support the new Minecraft version. Do not update a live server only because a newer version appears in the panel.'],
        ['Create a backup', 'Stop the server and create a complete backup of the world, configuration files, plugins, and mods. Download a separate copy when possible so you can return to the old version if the update fails.'],
        ['Choose the new version', 'Open the server software or version area in the dashboard. Select the correct software, such as Paper, Purpur, Fabric, Forge, or NeoForge, and then choose the Minecraft version. Keep the same software family unless you have planned a full conversion.'],
        ['Update extra files', 'Replace plugins and mods with versions made for the new server version. Install any new dependencies they require. Old files may load incorrectly even when the server itself starts.'],
        ['Start and test', 'Start the server and read the console for warnings or errors. Test joining, inventories, dimensions, plugins, mods, and important builds before allowing everyone back. Restore the backup if the world or required features do not work correctly.'],
      ] },
      { slug: 'server-commands', title: 'Server Commands', summary: 'A practical reference for common automation, moderation, world, navigation, and border commands.', sections: [], commandGroups: serverCommandGroups },
      { slug: 'daily-backups', title: 'How to Set Up Daily Backups', summary: 'Schedule a daily copy of your Minecraft world and confirm that it can be restored.', sections: [['Create a first backup', 'Stop the server or make sure the world has finished saving, then create a manual backup. Keep this copy until you have confirmed that the daily schedule works.'], ['Add a daily schedule', 'Open the backup or schedules area for your server, create a new backup task, and set it to run once every 24 hours at a quiet time for your community.'], ['Set retention', 'Choose how many daily backups to keep so old copies do not fill the available storage. Keep at least one separate download outside the active server.'], ['Verify the schedule', 'After the first scheduled run, check its completion time and file size. Periodically test a restore on a separate server or folder so you know the backup is usable.']] },
    ],
  },
  {
    label: 'Server Optimizations',
    items: [
      { slug: 'server-optimization', title: 'Server Optimization', summary: 'Find the real cause of Minecraft server lag and improve performance without breaking gameplay.', sections: [
        ['Measure before changing settings', 'Do not copy a large optimization preset and hope it works. Test the server under normal player load and record the results first.', ['Aim for 20 TPS. Players may notice server lag when TPS stays below 18.', 'Keep MSPT below 50 ms so the server can complete each tick on time.', 'Use a profiler such as spark to find slow plugins, entities, chunks, or tasks.', 'Change one setting at a time, restart when needed, and measure again.']],
        ['Use suitable server software', 'Paper is a strong general choice for plugin servers. Purpur adds more controls, while Fabric is designed for modded servers.', ['Keep the server software, Java version, plugins, and mods updated.', 'Do not reload plugins while the server is running. Restart the server after plugin changes.', 'For Vanilla, Fabric, or Spigot, setting sync-chunk-writes=false can reduce work on the main tick thread. Paper already handles this setting.']],
        ['Start with view and simulation distance', 'These settings control how many chunks the server sends and actively updates. Lower values reduce CPU and memory use.', ['Try view-distance=7 and simulation-distance=4 as a conservative starting point.', 'Raise them only if the server stays below 50 MSPT during busy periods.', 'If lag starts while players explore, consider pregenerating the world and setting a world border.', 'Remember that the Overworld, Nether, and End use separate borders.']],
        ['Control entities and machines carefully', 'Mobs, dropped items, villagers, hoppers, and redstone machines can create heavy tick load.', ['Use the profiler to find the affected world and area before lowering global limits.', 'Reduce mob spawn or activation ranges in small steps. Very low values can break farms and normal behavior.', 'Increase hopper delays only after checking item sorters and hopper clocks.', 'Use item merge and despawn settings instead of adding a plugin that repeatedly scans and clears the world.']],
        ['Review plugins and memory', 'More RAM does not always fix lag. Too much memory can make garbage-collection pauses longer.', ['Remove plugins you do not use and test new plugins on a copy of the server.', 'Look closely at anti-cheat, shops, holograms, maps, databases, and tasks that run every tick.', 'Use the Java version required by your Minecraft and server-software versions.', 'Use the hosting panel’s supported startup settings. Do not paste a long list of JVM flags without checking the available RAM and Java version.']],
        ['Match the fix to the symptom', 'Different types of lag need different solutions.', ['Low TPS during exploration: reduce distance settings or pregenerate chunks.', 'Lag that gets worse over time: profile plugins and check for growing entity or item counts.', 'Regular short freezes: inspect backups, world saves, and garbage collection.', 'High player ping while TPS stays near 20: check the server location and network route instead of changing gameplay settings.']],
      ] },
      { slug: 'configuration-finder', title: 'Configuration Finder', summary: 'Search for a server setting and learn exactly where to change it.', sections: [], configurationFinder: true },
    ],
  },
  {
    label: 'Mods and plugins',
    items: [
      { slug: 'add-plugin', title: 'How to Add a Plugin', summary: 'Install and test a plugin on a compatible Minecraft server.', sections: [['Confirm the server type', 'Plugins require compatible server software such as Paper or Purpur. A plugin will not work on a normal Vanilla, Fabric, Forge, or NeoForge server unless that platform specifically supports it.'], ['Download the correct file', 'Choose a trusted plugin release that supports your Minecraft and server-software versions. Read its page for required dependencies, then download the .jar file.'], ['Install the plugin', 'Stop the server, open File Manager, and upload the .jar file to the plugins folder. Start the server and watch the console while the plugin creates its configuration folder.'], ['Test before adding more', 'Join the server and test the plugin’s main feature and commands. Add only a few plugins at a time so a broken dependency or conflict is easy to identify.']] },
      { slug: 'remove-plugin', title: 'How to Remove a Plugin', summary: 'Uninstall a plugin and decide whether to keep or delete its saved data.', sections: [['Back up the server', 'Create a complete backup before removing a plugin, especially when it stores inventories, permissions, economies, claims, or other player data.'], ['Remove the plugin file', 'Stop the server and delete the plugin’s .jar file from the plugins folder. Never remove or reload plugins while the server is running.'], ['Handle saved data', 'Most plugins leave a folder containing settings and data. Keep or download that folder if you may reinstall the plugin. Delete it only when you are certain the saved information is no longer needed.'], ['Restart and check', 'Start the server, read the console, and test any plugins that depended on the removed one. Restore the backup if removing it damages required data or prevents the server from starting.']] },
      { slug: 'installing-mods', title: 'How to Add a Mod', summary: 'Install Fabric, Forge, or NeoForge mods without replacing your world files.', sections: [['Match the versions', 'The Minecraft version, mod loader, loader version, mod version, and required libraries must all be compatible. Read the mod page before downloading anything.'], ['Prepare the server', 'Create a backup and stop the server. Install the correct Fabric, Forge, or NeoForge server software before uploading mods.'], ['Upload the mod', 'Place the mod .jar and its required dependency files in the mods folder. Do not extract the .jar file and do not place it in the plugins folder.'], ['Prepare each player', 'Check whether the mod is server-only or must also be installed by players. Client-required mods and dependencies must match the server versions.'], ['Start and test', 'Start the server and read the first clear error if it fails. Test the mod with a matching client before adding another mod or inviting players.']] },
      { slug: 'remove-mod', title: 'How to Remove a Mod', summary: 'Remove a mod while reducing the risk of world corruption or missing content.', sections: [['Check what the mod adds', 'Mods that add blocks, items, entities, biomes, or dimensions may permanently change the world. Read the author’s removal instructions before continuing.'], ['Test a backup first', 'Create a complete backup and make a test copy of the server. Removing content mods directly from the only copy of a world can leave missing blocks, broken items, or unloadable dimensions.'], ['Remove the files', 'Stop the test server and delete the mod .jar from the mods folder. Remove it from player computers if it was client-required, and check whether other mods depended on it.'], ['Start and inspect the world', 'Start the test copy, review the console, and inspect important areas, inventories, and dimensions. Make the same change on the live server only when the test is successful.']] },
      { slug: 'mods-and-plugins', title: 'Plugins and Modpacks', summary: 'Choose the correct server software for plugins or a modpack.', sections: [['Choose one ecosystem', 'Paper and its derivatives use plugins, while Forge and Fabric use mods. They are not interchangeable by default.'], ['Install in small groups', 'Add a few extensions at a time and start the server between groups to make conflicts easier to identify.'], ['Read the logs', 'Warnings and errors in the startup log usually identify missing dependencies, incompatible versions, or configuration problems.']] },
      { slug: 'modpack-memory', title: 'Modpack Memory Guide', summary: 'Choose practical memory settings for Forge and Fabric modpacks.', sections: [['Start with the pack guidance', 'Use the modpack author’s recommendation as a starting point and account for expected player count.'], ['Avoid unnecessary allocation', 'More allocated memory does not automatically improve performance and can make long garbage-collection pauses worse.'], ['Track actual use', 'Monitor memory during exploration and busy periods, then upgrade only when the server regularly lacks safe headroom.']] },
    ],
  },
  {
    label: 'Server management',
    items: [
      { slug: 'backups', title: 'Backups', summary: 'Protect worlds before updates and configuration changes.', sections: [['Use more than one copy', 'Keep recent backups on the server and a separate copy outside the active server files.'], ['Back up while stopped', 'For the most consistent archive, stop the server or use a tool that safely flushes world data first.'], ['Test restoration', 'A backup is only useful if it can be restored. Periodically test an archive in a separate folder.']] },
      { slug: 'file-access', title: 'File Access', summary: 'Work with server files without risking the active world.', sections: [['Stop before replacing files', 'Stop the server before replacing jars, worlds, or important configuration files.'], ['Preserve names and paths', 'Keep the directory structure expected by the server and avoid duplicate nested world folders.'], ['Keep a rollback copy', 'Download or rename the previous file before replacing it so the change can be reversed quickly.']] },
    ],
  },
]

const documentationEntries = documentationGroups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.label })))

const getDocumentationGroupSlug = (label) => label
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')

const optimizationForms = {
  'server-optimization': { title: 'Full server optimization', copy: 'Request a broad review of server performance, settings, and resource use.' },
}

const configurationSettings = [
  { title: 'Render or view distance', location: 'Files → server.properties', setting: 'view-distance', description: 'Controls how many chunks the server sends to each player.', keywords: 'render view distance chunks range' },
  { title: 'Simulation distance', location: 'Files → server.properties', setting: 'simulation-distance', description: 'Controls how far away entities and block updates keep running.', keywords: 'simulation distance ticking active chunks' },
  { title: 'Maximum players', location: 'Files → server.properties', setting: 'max-players', description: 'Sets how many players can join the server at the same time.', keywords: 'maximum max players slots limit' },
  { title: 'Default game mode', location: 'Files → server.properties', setting: 'gamemode', description: 'Sets the game mode used for new players.', keywords: 'game mode gamemode survival creative adventure spectator' },
  { title: 'Difficulty', location: 'Files → server.properties', setting: 'difficulty', description: 'Changes the world difficulty to peaceful, easy, normal, or hard.', keywords: 'difficulty peaceful easy normal hard' },
  { title: 'Player versus player', location: 'Files → server.properties', setting: 'pvp', description: 'Turns damage between players on or off.', keywords: 'pvp player damage fighting' },
  { title: 'Spawn protection', location: 'Files → server.properties', setting: 'spawn-protection', description: 'Controls the protected area around the world spawn.', keywords: 'spawn protection protected radius blocks build' },
  { title: 'Command blocks', location: 'Files → server.properties', setting: 'enable-command-block', description: 'Allows or blocks command blocks on the server.', keywords: 'command blocks enable automation' },
  { title: 'Whitelist', location: 'Console or server.properties', setting: 'white-list', description: 'Limits joining to players you approve.', keywords: 'whitelist white list approved players access' },
  { title: 'Server message', location: 'Files → server.properties', setting: 'motd', description: 'Changes the message shown under the server name in Minecraft.', keywords: 'motd server message description multiplayer list' },
  { title: 'Allow flight', location: 'Files → server.properties', setting: 'allow-flight', description: 'Prevents flying players from being removed by the server.', keywords: 'allow flight flying kick' },
  { title: 'Server memory', location: 'Dashboard → Startup', setting: 'Memory allocation', description: 'Memory is managed in the dashboard, not inside a Minecraft config file.', keywords: 'memory ram java startup allocation' },
  { title: 'Server address and port', location: 'Dashboard → Network', setting: 'Primary allocation', description: 'The public IP address and port are managed in the Network area.', keywords: 'ip address port network join connection' },
  { title: 'Plugin settings', location: 'Files → plugins → PluginName', setting: 'config.yml', description: 'Most plugins create their own folder and configuration file after the first start.', keywords: 'plugin config configuration yml settings' },
]

const moreInfo = [
  {
    title: 'Support Ticket',
    subtitle: 'Send a request to the Axiom support team.',
    href: '/support',
  },
  {
    title: 'Partner Program',
    subtitle: 'Share Axiom and earn from qualified referrals.',
    href: '/programs/promotion',
  },
  {
    title: 'Promotion Program',
    subtitle: 'Learn how approved promotions work.',
    href: '/programs/promotion#promotion-program',
  },
  {
    title: 'Server Lists',
    subtitle: 'Find information about Axiom server listings.',
    href: '/server-lists',
  },
  {
    title: 'Legal',
    subtitle: 'Privacy and terms of service.',
    href: '/legal',
  },
]

const searchSuggestions = ['Search', 'Minecraft guides', 'Search', 'plugins', 'Search', 'server setup', 'Search', 'support']

const languages = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'ru', label: 'Русский' },
]

function getPreferredLanguage() {
  if (typeof navigator === 'undefined') return 'en'
  const supported = new Set(languages.map((language) => language.code))
  const preferences = navigator.languages?.length ? navigator.languages : [navigator.language]
  return preferences.map((language) => language?.toLowerCase().split('-')[0]).find((language) => supported.has(language)) ?? 'en'
}

const translations = {
  de: {
    Products: 'Produkte', Programs: 'Programme', 'More info': 'Mehr erfahren', 'Log in': 'Anmelden', Login: 'Anmelden', Search: 'Suchen',
    'Search Axiom Hosting': 'Axiom Hosting durchsuchen', Documents: 'Dokumente', Forms: 'Formulare',
    'No results found': 'Keine Ergebnisse gefunden', 'Try another word or check the spelling.': 'Versuche ein anderes Wort oder prüfe die Schreibweise.',
    'Get started': 'Loslegen', Pricing: 'Preise', Locations: 'Standorte', Reviews: 'Bewertungen', Domains: 'Domains',
    'Hosting that fits the work.': 'Hosting, das zur Aufgabe passt.', 'Choose the right region.': 'Wähle die passende Region.',
    'Customer feedback.': 'Kundenfeedback.', 'Find your domain.': 'Finde deine Domain.',
    'View plans': 'Tarife ansehen', 'View locations': 'Standorte ansehen', 'Search domains': 'Domains suchen',
    'Enter a domain name': 'Domainnamen eingeben', Language: 'Sprache',
    'Hosting for websites, applications, and growing teams, with clear tools for launching, managing, and moving your projects.': 'Hosting für Websites, Anwendungen und wachsende Teams – mit klaren Werkzeugen zum Starten, Verwalten und Umziehen deiner Projekte.',
    'Why Axiom': 'Warum Axiom', 'Clearer control': 'Klare Kontrolle', 'Support when needed': 'Hilfe, wenn sie gebraucht wird', 'A smoother move': 'Ein reibungsloser Umzug', 'Flexible options': 'Flexible Optionen', 'One place to manage': 'Alles an einem Ort',
    'For websites and apps': 'Für Websites und Apps', 'For more control': 'Für mehr Kontrolle', 'For demanding workloads': 'Für anspruchsvolle Workloads',
    'Cloud Hosting': 'Cloud-Hosting', 'VPS Hosting': 'VPS-Hosting', 'Dedicated Servers': 'Dedizierte Server',
    'Available data centers': 'Verfügbare Rechenzentren', 'Verified reviews are coming': 'Verifizierte Bewertungen folgen',
    'Search for a name for your next website or project.': 'Suche einen Namen für deine nächste Website oder dein nächstes Projekt.',
    Company: 'Unternehmen', 'Data Centers': 'Rechenzentren', Documentation: 'Dokumentation', Support: 'Support', Privacy: 'Datenschutz', Terms: 'Bedingungen',
    'Getting started': 'Erste Schritte', 'Moving a website': 'Website umziehen', 'Managing domains': 'Domains verwalten', 'Support request': 'Supportanfrage', 'Website transfer': 'Website-Umzug', 'Sales enquiry': 'Vertriebsanfrage',
    'Straightforward hosting tools for managing websites, applications, and infrastructure.': 'Klare Hosting-Werkzeuge zum Verwalten von Websites, Anwendungen und Infrastruktur.',
    'Manage hosting and resources without unnecessary layers or confusing workflows.': 'Verwalte Hosting und Ressourcen ohne unnötige Ebenen oder komplizierte Abläufe.',
    'Get guidance when choosing, configuring, or managing your hosting.': 'Erhalte Unterstützung bei Auswahl, Einrichtung und Verwaltung deines Hostings.',
    'Plan the switch clearly, whether you are transferring one site or several projects.': 'Plane den Umzug übersichtlich – für eine Website oder mehrere Projekte.',
    'Choose cloud, virtual, or dedicated hosting based on what your project needs.': 'Wähle Cloud-, virtuelles oder dediziertes Hosting passend zu deinem Projekt.',
    'Keep your domains, hosting, and servers organized within the same platform.': 'Verwalte Domains, Hosting und Server auf einer gemeinsamen Plattform.',
    'Compare the available hosting types, then continue to the order page for current plans and pricing.': 'Vergleiche die Hosting-Arten und sieh auf der Bestellseite aktuelle Tarife und Preise.',
    'Managed hosting for projects that need a straightforward place to run.': 'Verwaltetes Hosting für Projekte, die eine unkomplizierte Umgebung benötigen.',
    'Virtual server options for workloads that need dedicated resources.': 'Virtuelle Server für Workloads, die eigene Ressourcen benötigen.',
    'Dedicated hardware options for larger applications and infrastructure.': 'Dedizierte Hardware für größere Anwendungen und Infrastrukturen.',
    'See the locations available for your selected service during ordering and choose the region that works for your project.': 'Sieh beim Bestellen die verfügbaren Standorte und wähle die passende Region für dein Projekt.',
    'Customer feedback will appear here once verified reviews are available.': 'Kundenfeedback erscheint hier, sobald verifizierte Bewertungen verfügbar sind.',
    'Availability and current pricing are shown when you search.': 'Verfügbarkeit und aktuelle Preise werden bei der Suche angezeigt.',
    'Hosting for websites, applications, and growing teams.': 'Hosting für Websites, Anwendungen und wachsende Teams.',
    'Affiliate Program': 'Partnerprogramm', 'Agency Partners': 'Agenturpartner', 'Reseller Program': 'Reseller-Programm', 'Startup Program': 'Startup-Programm', 'About Axiom': 'Über Axiom', 'Domain name': 'Domainname', 'Close search': 'Suche schließen',
    'Set up your first hosting service.': 'Richte deinen ersten Hosting-Dienst ein.', 'Plan and complete a site transfer.': 'Plane und erledige einen Website-Umzug.', 'Connect and manage domain names.': 'Verbinde und verwalte Domainnamen.', 'Send a request to the support team.': 'Sende eine Anfrage an den Support.', 'Request help moving an existing website.': 'Fordere Hilfe beim Umzug einer Website an.', 'Ask about a hosting option before ordering.': 'Frage vor der Bestellung nach einer Hosting-Option.',
    Storage: 'Speicher', 'Cloud Storage': 'Cloud-Speicher', 'Store project files and data in a dedicated cloud environment.': 'Speichere Projektdateien und Daten in einer eigenen Cloud-Umgebung.', 'Virtual servers': 'Virtuelle Server', 'Scalable VPS': 'Skalierbarer VPS', 'Flexible virtual resources that can grow with your workload.': 'Flexible virtuelle Ressourcen, die mit deiner Auslastung wachsen.', Websites: 'Websites', 'Web Hosting': 'Webhosting', 'Straightforward hosting for websites, portfolios, and online projects.': 'Unkompliziertes Hosting für Websites, Portfolios und Online-Projekte.', 'Starting at': 'Ab',
    'Flexible plans': 'Flexible Tarife', 'Choose the service that fits your project. Current prices and configurations are shown during ordering.': 'Wähle den passenden Dienst für dein Projekt. Aktuelle Preise und Konfigurationen werden bei der Bestellung angezeigt.', Featured: 'Empfohlen', 'Good for': 'Geeignet für', '/ month': '/ Monat', 'Project files': 'Projektdateien', 'Backups and archives': 'Backups und Archive', 'Media libraries': 'Medienbibliotheken', 'Applications and APIs': 'Anwendungen und APIs', 'Development environments': 'Entwicklungsumgebungen', 'Changing workloads': 'Wechselnde Auslastung', 'Company websites': 'Unternehmenswebsites', Portfolios: 'Portfolios', 'Landing pages': 'Landingpages',
    'Domain registration': 'Domainregistrierung', 'Find your perfect domain': 'Finde deine perfekte Domain', 'Search for a name for your next website or project. Availability and current pricing are shown before ordering.': 'Suche einen Namen für deine nächste Website oder dein nächstes Projekt. Verfügbarkeit und aktuelle Preise werden vor der Bestellung angezeigt.', 'Search for your perfect domain': 'Suche nach deiner perfekten Domain', 'Check price': 'Preis prüfen',
  },
  fr: {
    Products: 'Produits', Programs: 'Programmes', 'More info': 'En savoir plus', 'Log in': 'Connexion', Login: 'Connexion', Search: 'Rechercher',
    'Search Axiom Hosting': 'Rechercher sur Axiom Hosting', Documents: 'Documents', Forms: 'Formulaires',
    'No results found': 'Aucun résultat', 'Try another word or check the spelling.': 'Essayez un autre mot ou vérifiez l’orthographe.',
    'Get started': 'Commencer', Pricing: 'Tarifs', Locations: 'Emplacements', Reviews: 'Avis', Domains: 'Domaines',
    'Hosting that fits the work.': 'Un hébergement adapté à vos besoins.', 'Choose the right region.': 'Choisissez la bonne région.',
    'Customer feedback.': 'Avis des clients.', 'Find your domain.': 'Trouvez votre domaine.',
    'View plans': 'Voir les offres', 'View locations': 'Voir les emplacements', 'Search domains': 'Rechercher un domaine',
    'Enter a domain name': 'Saisissez un nom de domaine', Language: 'Langue',
    'Hosting for websites, applications, and growing teams, with clear tools for launching, managing, and moving your projects.': 'Un hébergement pour les sites, les applications et les équipes en croissance, avec des outils clairs pour lancer, gérer et déplacer vos projets.',
    'Why Axiom': 'Pourquoi Axiom', 'Clearer control': 'Un contrôle plus clair', 'Support when needed': 'Une aide au bon moment', 'A smoother move': 'Une migration plus simple', 'Flexible options': 'Des options flexibles', 'One place to manage': 'Une gestion centralisée',
    'For websites and apps': 'Pour les sites et applications', 'For more control': 'Pour plus de contrôle', 'For demanding workloads': 'Pour les charges exigeantes',
    'Cloud Hosting': 'Hébergement cloud', 'VPS Hosting': 'Hébergement VPS', 'Dedicated Servers': 'Serveurs dédiés',
    'Available data centers': 'Centres de données disponibles', 'Verified reviews are coming': 'Les avis vérifiés arrivent bientôt',
    'Search for a name for your next website or project.': 'Recherchez un nom pour votre prochain site ou projet.',
    Company: 'Entreprise', 'Data Centers': 'Centres de données', Documentation: 'Documentation', Support: 'Assistance', Privacy: 'Confidentialité', Terms: 'Conditions',
    'Getting started': 'Bien démarrer', 'Moving a website': 'Déplacer un site', 'Managing domains': 'Gérer les domaines', 'Support request': 'Demande d’assistance', 'Website transfer': 'Transfert de site', 'Sales enquiry': 'Question commerciale',
    'Straightforward hosting tools for managing websites, applications, and infrastructure.': 'Des outils d’hébergement simples pour gérer sites, applications et infrastructure.',
    'Manage hosting and resources without unnecessary layers or confusing workflows.': 'Gérez l’hébergement et les ressources sans couches inutiles ni parcours complexes.',
    'Get guidance when choosing, configuring, or managing your hosting.': 'Obtenez de l’aide pour choisir, configurer et gérer votre hébergement.',
    'Plan the switch clearly, whether you are transferring one site or several projects.': 'Planifiez clairement la migration d’un site ou de plusieurs projets.',
    'Choose cloud, virtual, or dedicated hosting based on what your project needs.': 'Choisissez un hébergement cloud, virtuel ou dédié selon vos besoins.',
    'Keep your domains, hosting, and servers organized within the same platform.': 'Gérez domaines, hébergement et serveurs sur une seule plateforme.',
    'Compare the available hosting types, then continue to the order page for current plans and pricing.': 'Comparez les types d’hébergement, puis consultez les offres et tarifs actuels sur la page de commande.',
    'Managed hosting for projects that need a straightforward place to run.': 'Un hébergement géré pour les projets qui recherchent un environnement simple.',
    'Virtual server options for workloads that need dedicated resources.': 'Des serveurs virtuels pour les charges qui nécessitent des ressources dédiées.',
    'Dedicated hardware options for larger applications and infrastructure.': 'Du matériel dédié pour les applications et infrastructures plus importantes.',
    'See the locations available for your selected service during ordering and choose the region that works for your project.': 'Consultez les emplacements disponibles lors de la commande et choisissez la région adaptée.',
    'Customer feedback will appear here once verified reviews are available.': 'Les retours clients apparaîtront ici lorsque des avis vérifiés seront disponibles.',
    'Availability and current pricing are shown when you search.': 'La disponibilité et les tarifs actuels s’affichent lors de la recherche.',
    'Hosting for websites, applications, and growing teams.': 'Un hébergement pour les sites, les applications et les équipes en croissance.',
    'Affiliate Program': 'Programme d’affiliation', 'Agency Partners': 'Partenaires agences', 'Reseller Program': 'Programme revendeur', 'Startup Program': 'Programme startup', 'About Axiom': 'À propos d’Axiom', 'Domain name': 'Nom de domaine', 'Close search': 'Fermer la recherche',
    'Set up your first hosting service.': 'Configurez votre premier service d’hébergement.', 'Plan and complete a site transfer.': 'Planifiez et réalisez le transfert d’un site.', 'Connect and manage domain names.': 'Connectez et gérez vos noms de domaine.', 'Send a request to the support team.': 'Envoyez une demande à l’assistance.', 'Request help moving an existing website.': 'Demandez de l’aide pour déplacer un site existant.', 'Ask about a hosting option before ordering.': 'Renseignez-vous sur une option avant de commander.',
    Storage: 'Stockage', 'Cloud Storage': 'Stockage cloud', 'Store project files and data in a dedicated cloud environment.': 'Stockez les fichiers et données du projet dans un environnement cloud dédié.', 'Virtual servers': 'Serveurs virtuels', 'Scalable VPS': 'VPS évolutif', 'Flexible virtual resources that can grow with your workload.': 'Des ressources virtuelles flexibles qui évoluent avec votre charge.', Websites: 'Sites web', 'Web Hosting': 'Hébergement web', 'Straightforward hosting for websites, portfolios, and online projects.': 'Un hébergement simple pour les sites, portfolios et projets en ligne.', 'Starting at': 'À partir de',
    'Flexible plans': 'Offres flexibles', 'Choose the service that fits your project. Current prices and configurations are shown during ordering.': 'Choisissez le service adapté à votre projet. Les prix et configurations actuels s’affichent lors de la commande.', Featured: 'En vedette', 'Good for': 'Idéal pour', '/ month': '/ mois', 'Project files': 'Fichiers de projet', 'Backups and archives': 'Sauvegardes et archives', 'Media libraries': 'Bibliothèques multimédias', 'Applications and APIs': 'Applications et API', 'Development environments': 'Environnements de développement', 'Changing workloads': 'Charges variables', 'Company websites': 'Sites d’entreprise', Portfolios: 'Portfolios', 'Landing pages': 'Pages de destination',
    'Domain registration': 'Enregistrement de domaine', 'Find your perfect domain': 'Trouvez votre domaine idéal', 'Search for a name for your next website or project. Availability and current pricing are shown before ordering.': 'Recherchez un nom pour votre prochain site ou projet. La disponibilité et les tarifs actuels s’affichent avant la commande.', 'Search for your perfect domain': 'Recherchez votre domaine idéal', 'Check price': 'Voir le prix',
  },
  ru: {
    Products: 'Продукты', Programs: 'Программы', 'More info': 'Подробнее', 'Log in': 'Войти', Login: 'Войти', Search: 'Поиск',
    'Search Axiom Hosting': 'Поиск по Axiom Hosting', Documents: 'Документы', Forms: 'Формы',
    'No results found': 'Ничего не найдено', 'Try another word or check the spelling.': 'Попробуйте другое слово или проверьте написание.',
    'Get started': 'Начать', Pricing: 'Цены', Locations: 'Локации', Reviews: 'Отзывы', Domains: 'Домены',
    'Hosting that fits the work.': 'Хостинг для ваших задач.', 'Choose the right region.': 'Выберите подходящий регион.',
    'Customer feedback.': 'Отзывы клиентов.', 'Find your domain.': 'Найдите свой домен.',
    'View plans': 'Посмотреть тарифы', 'View locations': 'Посмотреть локации', 'Search domains': 'Найти домен',
    'Enter a domain name': 'Введите доменное имя', Language: 'Язык',
    'Hosting for websites, applications, and growing teams, with clear tools for launching, managing, and moving your projects.': 'Хостинг для сайтов, приложений и растущих команд с понятными инструментами для запуска, управления и переноса проектов.',
    'Why Axiom': 'Почему Axiom', 'Clearer control': 'Понятное управление', 'Support when needed': 'Поддержка при необходимости', 'A smoother move': 'Простой перенос', 'Flexible options': 'Гибкие варианты', 'One place to manage': 'Всё в одном месте',
    'For websites and apps': 'Для сайтов и приложений', 'For more control': 'Для большего контроля', 'For demanding workloads': 'Для высоких нагрузок',
    'Cloud Hosting': 'Облачный хостинг', 'VPS Hosting': 'VPS-хостинг', 'Dedicated Servers': 'Выделенные серверы',
    'Available data centers': 'Доступные дата-центры', 'Verified reviews are coming': 'Проверенные отзывы скоро появятся',
    'Search for a name for your next website or project.': 'Найдите имя для следующего сайта или проекта.',
    Company: 'Компания', 'Data Centers': 'Дата-центры', Documentation: 'Документация', Support: 'Поддержка', Privacy: 'Конфиденциальность', Terms: 'Условия',
    'Getting started': 'Начало работы', 'Moving a website': 'Перенос сайта', 'Managing domains': 'Управление доменами', 'Support request': 'Запрос в поддержку', 'Website transfer': 'Перенос сайта', 'Sales enquiry': 'Вопрос отделу продаж',
    'Straightforward hosting tools for managing websites, applications, and infrastructure.': 'Понятные инструменты хостинга для управления сайтами, приложениями и инфраструктурой.',
    'Manage hosting and resources without unnecessary layers or confusing workflows.': 'Управляйте хостингом и ресурсами без лишних уровней и сложных процессов.',
    'Get guidance when choosing, configuring, or managing your hosting.': 'Получайте помощь при выборе, настройке и управлении хостингом.',
    'Plan the switch clearly, whether you are transferring one site or several projects.': 'Планируйте перенос одного сайта или нескольких проектов без лишней сложности.',
    'Choose cloud, virtual, or dedicated hosting based on what your project needs.': 'Выбирайте облачный, виртуальный или выделенный хостинг под задачи проекта.',
    'Keep your domains, hosting, and servers organized within the same platform.': 'Управляйте доменами, хостингом и серверами на одной платформе.',
    'Compare the available hosting types, then continue to the order page for current plans and pricing.': 'Сравните виды хостинга и перейдите к заказу, чтобы увидеть актуальные тарифы и цены.',
    'Managed hosting for projects that need a straightforward place to run.': 'Управляемый хостинг для проектов, которым нужна простая рабочая среда.',
    'Virtual server options for workloads that need dedicated resources.': 'Виртуальные серверы для задач, которым нужны выделенные ресурсы.',
    'Dedicated hardware options for larger applications and infrastructure.': 'Выделенное оборудование для крупных приложений и инфраструктуры.',
    'See the locations available for your selected service during ordering and choose the region that works for your project.': 'Посмотрите доступные локации при заказе и выберите подходящий регион.',
    'Customer feedback will appear here once verified reviews are available.': 'Отзывы клиентов появятся здесь после проверки.',
    'Availability and current pricing are shown when you search.': 'Доступность и актуальные цены отображаются при поиске.',
    'Hosting for websites, applications, and growing teams.': 'Хостинг для сайтов, приложений и растущих команд.',
    'Affiliate Program': 'Партнёрская программа', 'Agency Partners': 'Партнёры-агентства', 'Reseller Program': 'Программа реселлеров', 'Startup Program': 'Программа для стартапов', 'About Axiom': 'Об Axiom', 'Domain name': 'Доменное имя', 'Close search': 'Закрыть поиск',
    'Set up your first hosting service.': 'Настройте свой первый хостинг.', 'Plan and complete a site transfer.': 'Спланируйте и выполните перенос сайта.', 'Connect and manage domain names.': 'Подключайте доменные имена и управляйте ими.', 'Send a request to the support team.': 'Отправьте запрос в службу поддержки.', 'Request help moving an existing website.': 'Запросите помощь с переносом существующего сайта.', 'Ask about a hosting option before ordering.': 'Уточните детали хостинга перед заказом.',
    Storage: 'Хранилище', 'Cloud Storage': 'Облачное хранилище', 'Store project files and data in a dedicated cloud environment.': 'Храните файлы и данные проекта в отдельной облачной среде.', 'Virtual servers': 'Виртуальные серверы', 'Scalable VPS': 'Масштабируемый VPS', 'Flexible virtual resources that can grow with your workload.': 'Гибкие виртуальные ресурсы, которые растут вместе с нагрузкой.', Websites: 'Сайты', 'Web Hosting': 'Веб-хостинг', 'Straightforward hosting for websites, portfolios, and online projects.': 'Простой хостинг для сайтов, портфолио и онлайн-проектов.', 'Starting at': 'От',
    'Flexible plans': 'Гибкие тарифы', 'Choose the service that fits your project. Current prices and configurations are shown during ordering.': 'Выберите сервис для своего проекта. Актуальные цены и конфигурации отображаются при заказе.', Featured: 'Рекомендуем', 'Good for': 'Подходит для', '/ month': '/ месяц', 'Project files': 'Файлы проекта', 'Backups and archives': 'Резервные копии и архивы', 'Media libraries': 'Медиабиблиотеки', 'Applications and APIs': 'Приложения и API', 'Development environments': 'Среды разработки', 'Changing workloads': 'Меняющиеся нагрузки', 'Company websites': 'Сайты компаний', Portfolios: 'Портфолио', 'Landing pages': 'Лендинги',
    'Domain registration': 'Регистрация домена', 'Find your perfect domain': 'Найдите идеальный домен', 'Search for a name for your next website or project. Availability and current pricing are shown before ordering.': 'Найдите имя для следующего сайта или проекта. Доступность и актуальные цены отображаются до заказа.', 'Search for your perfect domain': 'Найдите идеальный домен', 'Check price': 'Проверить цену',
  },
}

const searchCatalog = [
  { type: 'Programs', title: 'Partner Program', description: 'Promote Axiom through a tracked link and earn from qualified referrals.', href: '/programs/promotion', keywords: 'partner affiliate referral creator promote axiom hosting commission program' },
  { type: 'Documents', title: 'Change a Minecraft server logo', description: 'Add or replace the icon shown in the server list.', href: '/documents/server-logo', keywords: 'minecraft server logo icon image png setup' },
  { type: 'Documents', title: 'Change server location', description: 'Move a Minecraft server to another available region.', href: '/documents/change-server-location', keywords: 'minecraft server location region move migrate latency setup' },
  { type: 'Documents', title: 'Find your server address', description: 'Locate the Minecraft server subdomain, primary IP, and port.', href: '/documents/find-server-address', keywords: 'minecraft server ip address port network connect join subdomain' },
  { type: 'Documents', title: 'Server commands', description: 'Use common automation, moderation, world, navigation, and border commands.', href: '/documents/server-commands', keywords: 'minecraft server console commands automation player management world navigation border' },
  { type: 'Documents', title: 'Set up daily backups', description: 'Schedule and verify daily Minecraft server backups.', href: '/documents/daily-backups', keywords: 'minecraft server backup daily schedule restore setup' },
  { type: 'Documents', title: 'Set up and manage roles', description: 'Create operator, administrator, moderator, helper, and player access.', href: '/documents/role-management', keywords: 'minecraft server roles permissions groups op admin moderator staff luckperms management' },
  { type: 'Documents', title: 'Create a Minecraft server', description: 'Configure and launch your first world.', href: '/packages', keywords: 'minecraft server start setup create launch world guide docs documentation' },
  { type: 'Documents', title: 'Install plugins and mods', description: 'Prepare a server for plugins or a modpack.', href: '/documents/mods-and-plugins', keywords: 'minecraft mods modpack plugins paper forge fabric setup guide docs documentation' },
  { type: 'Documents', title: 'Add a plugin', description: 'Install and test a plugin on Paper or Purpur.', href: '/documents/add-plugin', keywords: 'minecraft plugin install add paper purpur jar' },
  { type: 'Documents', title: 'Remove a plugin', description: 'Uninstall a plugin while protecting its saved data.', href: '/documents/remove-plugin', keywords: 'minecraft plugin remove uninstall delete data jar' },
  { type: 'Documents', title: 'Add a mod', description: 'Install a Fabric, Forge, or NeoForge mod.', href: '/documents/installing-mods', keywords: 'minecraft mod install add fabric forge neoforge jar' },
  { type: 'Documents', title: 'Remove a mod', description: 'Safely remove a mod without damaging the world.', href: '/documents/remove-mod', keywords: 'minecraft mod remove uninstall delete world backup' },
  { type: 'Documents', title: 'Update a Minecraft server', description: 'Safely update Minecraft and server software.', href: '/documents/update-server', keywords: 'minecraft server update upgrade version paper purpur fabric forge' },
  { type: 'Documents', title: 'Find a server setting', description: 'Search for render distance, difficulty, player limits, and other configuration options.', href: '/documents/configuration-finder', keywords: 'minecraft configuration config setting render view distance simulation players pvp difficulty motd' },
  { type: 'Documents', title: 'Choose memory for a modpack', description: 'Set practical RAM limits for Forge and Fabric servers.', href: '/documents/modpack-memory', keywords: 'optimize ram memory forge fabric modpack java garbage collection performance docs documentation' },
  { type: 'Documents', title: 'Improve server performance', description: 'Find the cause of lag before changing server settings.', href: '/documents/server-optimization', keywords: 'optimize diagnose fix low tps lag entities chunks plugins cpu ram performance docs documentation' },
  { type: 'Documents', title: 'Move an existing world', description: 'Transfer a Minecraft world to Axiom.', href: '/documents/world-transfer', keywords: 'minecraft move migrate transfer world save upload docs documentation' },
  { type: 'Support', title: 'Support request', description: 'Send a request to the support team.', href: '/support', keywords: 'help support contact ticket request form' },
  { type: 'Legal', title: 'Legal', description: 'Review privacy information and terms of service.', href: '/legal', keywords: 'legal privacy terms service tos policy' },
  { type: 'Forms', title: 'World transfer', description: 'Request help moving an existing Minecraft world.', href: '/forms/world-transfer', keywords: 'minecraft move migrate transfer world form' },
  { type: 'Forms', title: 'Plan question', description: 'Ask about a Minecraft server before ordering.', href: '/forms/sales-enquiry', keywords: 'minecraft server sales price pricing quote question order form' },
  ...Object.entries(optimizationForms).map(([slug, form]) => ({
    type: 'Forms',
    title: form.title,
    description: form.copy,
    href: `/forms/optimization/${slug}`,
    keywords: `minecraft optimization performance request form ${slug.replaceAll('-', ' ')}`,
  })),
]

function translate(language, text) {
  return translations[language]?.[text] ?? text
}

function LanguagePicker({ language, setLanguage, placement = 'footer' }) {
  const [open, setOpen] = useState(false)
  const pickerRef = useRef(null)

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!pickerRef.current?.contains(event.target)) setOpen(false)
    }
    const closeOnEscape = (event) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  return (
    <div className={`language-picker language-picker--${placement}`} ref={pickerRef}>
      <button
        className="language-trigger"
        type="button"
        aria-label={translate(language, 'Language')}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14.2 14.2 0 0 1 0 18M12 3a14.2 14.2 0 0 0 0 18" />
        </svg>
        <span className="language-name">{languages.find((option) => option.code === language)?.label}</span>
        <span className="language-code">{language.toUpperCase()}</span>
        <svg className="language-chevron" viewBox="0 0 12 12" aria-hidden="true"><path d="m2.25 4.5 3.75 3 3.75-3" /></svg>
      </button>
      {open && (
        <div className="language-menu" role="menu">
          {languages.map((option) => (
            <button
              type="button"
              role="menuitemradio"
              aria-checked={language === option.code}
              className={language === option.code ? 'is-selected' : ''}
              key={option.code}
              onClick={() => { setLanguage(option.code); setOpen(false) }}
            >
              <span>{option.label}</span>
              {language === option.code && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function editDistance(first, second) {
  const previous = Array.from({ length: second.length + 1 }, (_, index) => index)
  for (let row = 1; row <= first.length; row += 1) {
    let diagonal = previous[0]
    previous[0] = row
    for (let column = 1; column <= second.length; column += 1) {
      const above = previous[column]
      previous[column] = Math.min(
        previous[column] + 1,
        previous[column - 1] + 1,
        diagonal + (first[row - 1] === second[column - 1] ? 0 : 1),
      )
      diagonal = above
    }
  }
  return previous[second.length]
}

function matchesSearch(item, query, language) {
  const queryWords = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  if (!queryWords.length) return true
  const itemWords = `${item.type} ${translate(language, item.type)} ${item.title} ${translate(language, item.title)} ${item.description} ${item.keywords}`
    .toLowerCase()
    .match(/[\p{L}\p{N}]+/gu) ?? []

  return queryWords.every((queryWord) => itemWords.some((itemWord) => {
    if (itemWord.includes(queryWord) || queryWord.includes(itemWord)) return true
    const allowedErrors = queryWord.length >= 8 ? 2 : queryWord.length >= 4 ? 1 : 0
    return editDistance(queryWord, itemWord) <= allowedErrors
  }))
}

function ProductIcon({ name }) {
  const paths = {
    cloud: <path d="M7 18h10.5a4.5 4.5 0 0 0 .7-8.95A6.5 6.5 0 0 0 5.88 7.8 5.25 5.25 0 0 0 7 18Z" />,
    server: (
      <>
        <rect x="4" y="4" width="16" height="6" rx="1.5" />
        <rect x="4" y="14" width="16" height="6" rx="1.5" />
        <path d="M8 7h.01M8 17h.01" />
      </>
    ),
    rack: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M8 7h8M8 12h8M8 17h5" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14.2 14.2 0 0 1 0 18M12 3a14.2 14.2 0 0 0 0 18" />
      </>
    ),
  }

  return (
    <span className="product-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {paths[name]}
      </svg>
    </span>
  )
}

function MobPlanIcon({ name }) {
  const icons = {
    bee: <><path d="M7 8h10v8H7zM9 8V6h6v2M9 10h6M9 14h6" /><path d="M7 10 4 8v5l3 1M17 10l3-2v5l-3 1" /></>,
    wolf: <><path d="m7 8 2-3 3 2 3-2 2 3v8l-5 3-5-3Z" /><path d="M9 12h.01M15 12h.01M10 15h4" /></>,
    spider: <><circle cx="12" cy="12" r="4" /><path d="M8.5 10 5 7M8 12H3M8.5 14 5 17M15.5 10 19 7M16 12h5M15.5 14l3.5 3" /><path d="M11 11h.01M13 11h.01" /></>,
    blaze: <><path d="M9 5h6v7H9zM8 15h8M6 9H4M20 9h-2M7 19l2-3M17 19l-2-3" /><path d="M11 8h.01M13 8h.01" /></>,
    wither: <><path d="M4 8h5v5H4zM10 6h5v7h-5zM16 8h5v5h-5zM7 13h10v4H7zM9 17v3M15 17v3" /><path d="M6 10h.01M12 9h.01M18 10h.01" /></>,
    warden: <><path d="M7 7h10v11H7zM7 9 4 6v6M17 9l3-3v6M10 11h.01M14 11h.01M10 15h4" /></>,
  }

  return <span className="mob-plan-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg></span>
}

function DiscordIcon() {
  return <svg className="discord-logo" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.7 5.3A16.2 16.2 0 0 0 15.6 4l-.5 1a15.4 15.4 0 0 0-6.2 0l-.5-1a16.2 16.2 0 0 0-4.1 1.3C1.7 9.1 1 12.8 1.3 16.5a16.8 16.8 0 0 0 5 2.5l1.2-1.6c-.7-.3-1.4-.7-2-1.2l.5-.4c3.8 1.8 8.2 1.8 12 0l.5.4c-.6.5-1.3.9-2 1.2l1.2 1.6a16.8 16.8 0 0 0 5-2.5c.4-4.3-.7-8-3-11.2ZM8.5 14.2c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm7 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z" /></svg>
}

function MenuItems({ items, showIcons = false, language }) {
  return items.map((item) => (
    <a className="menu-item" href={item.href ?? '#'} key={item.title}>
      {showIcons && <ProductIcon name={item.icon} />}
      <span>
        <strong>{translate(language, item.title)}</strong>
        <small>{translate(language, item.subtitle)}</small>
      </span>
    </a>
  ))
}

function SearchSuggestion({ language }) {
  const [wordIndex, setWordIndex] = useState(0)
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const word = translate(language, searchSuggestions[wordIndex])
    let delay = isDeleting ? 55 : 90

    if (!isDeleting && text === word) delay = word === 'Search' ? 5000 : 1100
    if (isDeleting && text === '') delay = 220

    const timer = window.setTimeout(() => {
      if (!isDeleting && text === word) {
        setIsDeleting(true)
        return
      }

      if (isDeleting && text === '') {
        setIsDeleting(false)
        setWordIndex((current) => (current + 1) % searchSuggestions.length)
        return
      }

      setText(word.slice(0, text.length + (isDeleting ? -1 : 1)))
    }, delay)

    return () => window.clearTimeout(timer)
  }, [isDeleting, language, text, wordIndex])

  return <span className="search-suggestion" aria-hidden="true">{text}</span>
}

function Navigation({ language, searchOnly = false }) {
  const [activeMenu, setActiveMenu] = useState(null)
  const [pinnedMenu, setPinnedMenu] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const headerRef = useRef(null)
  const menuRef = useRef(null)
  const triggerRefs = useRef({})

  const searchResults = searchCatalog.filter((item) => matchesSearch(item, searchQuery, language))
  const groupedResults = ['Documents', 'Forms'].map((type) => ({
    type,
    items: searchResults.filter((item) => item.type === type),
  })).filter((group) => group.items.length)

  useEffect(() => {
    if (!searchOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [searchOpen])

  useLayoutEffect(() => {
    if (!activeMenu) return undefined

    const positionPointer = () => {
      const menu = menuRef.current
      const trigger = triggerRefs.current[activeMenu]
      if (!menu || !trigger) return

      const menuBox = menu.getBoundingClientRect()
      const triggerBox = trigger.getBoundingClientRect()
      const pointerPosition = triggerBox.left + triggerBox.width / 2 - menuBox.left
      menu.style.setProperty('--pointer-left', `${pointerPosition}px`)
    }

    positionPointer()
    window.addEventListener('resize', positionPointer)
    return () => window.removeEventListener('resize', positionPointer)
  }, [activeMenu])

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!headerRef.current?.contains(event.target)) {
        setActiveMenu(null)
        setPinnedMenu(null)
      }
    }

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setSearchOpen(false)
        setActiveMenu(null)
        setPinnedMenu(null)
        triggerRefs.current[activeMenu]?.focus()
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [activeMenu])

  const menus = {
    info: { items: moreInfo, label: 'More info' },
  }

  const currentMenu = activeMenu ? menus[activeMenu] : null

  return (
    <header
      className={`site-header${searchOnly ? ' site-header--search-only' : ''}`}
      ref={headerRef}
      onMouseLeave={() => setActiveMenu(pinnedMenu)}
    >
      <a className="brand" href="/" aria-label="Axiom Hosting home">
        <img src={axiomHostingWordmark} alt="AxiomHosting" />
      </a>

      <nav className="main-nav" aria-label="Primary navigation">
        <a className="nav-trigger" href="/packages">Packages</a>
        <a className="nav-trigger" href="/documents">Documents</a>
        {Object.entries(menus).map(([key, menu]) => (
          <button
            className={`nav-trigger nav-trigger--dropdown${activeMenu === key ? ' is-active' : ''}`}
            type="button"
            key={key}
            ref={(element) => { triggerRefs.current[key] = element }}
            aria-expanded={activeMenu === key}
            aria-controls="nav-dropdown"
            onMouseEnter={() => setActiveMenu(key)}
            onFocus={() => setActiveMenu(key)}
            onClick={() => {
              setActiveMenu(key)
              setPinnedMenu(key)
            }}
          >
            {menu.label}
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="m2.25 4.5 3.75 3 3.75-3" />
            </svg>
          </button>
        ))}
      </nav>

      <div className="nav-actions">
        <form
          className="search-box"
          role="search"
          onSubmit={(event) => { event.preventDefault(); setSearchOpen(true) }}
          onClick={() => setSearchOpen(true)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <label className="visually-hidden" htmlFor="site-search">{translate(language, 'Search')}</label>
          <input id="site-search" type="search" placeholder={searchOnly ? translate(language, 'Search') : ' '} readOnly aria-haspopup="dialog" />
          {!searchOnly && <SearchSuggestion language={language} />}
        </form>
        <HeroButton className="hero-button--secondary login-button" href="/dashboard">{translate(language, 'Login')}</HeroButton>
      </div>

      {currentMenu && (
        <div
          className="dropdown"
          id="nav-dropdown"
          ref={menuRef}
        >
          <div className="menu-grid">
            <MenuItems items={currentMenu.items} showIcons={currentMenu.icons} language={language} />
          </div>
        </div>
      )}

      {searchOpen && createPortal(
        <div className={`search-overlay${searchOnly ? ' search-overlay--dashboard' : ''}`} role="presentation" onPointerDown={(event) => {
          if (event.target === event.currentTarget) setSearchOpen(false)
        }}>
          <section className="search-dialog" role="dialog" aria-modal="true" aria-labelledby="search-dialog-title">
            <h2 className="visually-hidden" id="search-dialog-title">{translate(language, 'Search Axiom Hosting')}</h2>
            <div className="search-dialog-input">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4 4" />
              </svg>
              <label className="visually-hidden" htmlFor="global-search">{translate(language, 'Search')}</label>
              <input
                id="global-search"
                type="search"
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={translate(language, 'Search Axiom Hosting')}
              />
              <button type="button" className="search-close" onClick={() => setSearchOpen(false)} aria-label={translate(language, 'Close search')}>Esc</button>
            </div>

            <div className="search-results" aria-live="polite">
              {groupedResults.map((group) => (
                <div className="search-result-group" key={group.type}>
                  <h2>{translate(language, group.type)}</h2>
                  {group.items.map((item) => (
                    <a href={item.href} className="search-result" key={item.href}>
                      <span>
                        <strong>{translate(language, item.title)}</strong>
                        <small>{translate(language, item.description)}</small>
                      </span>
                      <span aria-hidden="true">→</span>
                    </a>
                  ))}
                </div>
              ))}
              {!searchResults.length && (
                <div className="search-empty">
                  <h2>{translate(language, 'No results found')}</h2>
                  <p>{translate(language, 'Try another word or check the spelling.')}</p>
                </div>
              )}
            </div>
          </section>
        </div>,
        document.body,
      )}
    </header>
  )
}

function HeroButton({ children, className, href }) {
  const [ripple, setRipple] = useState(null)

  const updateGlowPosition = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--cursor-x', `${event.clientX - bounds.left}px`)
    event.currentTarget.style.setProperty('--cursor-y', `${event.clientY - bounds.top}px`)
  }

  const handleClick = (event) => {
    if (className.includes('hero-button--calm')) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    event.preventDefault()
    const bounds = event.currentTarget.getBoundingClientRect()
    setRipple({
      id: Date.now(),
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    })

    window.setTimeout(() => window.location.assign(siteHref(href)), 650)
  }

  return (
    <a
      className={`hero-button ${className}`}
      href={href}
      onPointerEnter={updateGlowPosition}
      onPointerMove={updateGlowPosition}
      onClick={handleClick}
    >
      <span className="hero-button-label">{children}</span>
      {ripple && (
        <span
          className="hero-button-ripple"
          key={ripple.id}
          style={{ left: ripple.x, top: ripple.y }}
          aria-hidden="true"
        />
      )}
    </a>
  )
}

function WhyIcon({ name }) {
  const icons = {
    axiom: <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 5v8m-4-6 4 2 4-2" />,
    control: <path d="M4 6h10m4 0h2M4 12h3m4 0h9M4 18h8m4 0h4M14 4v4M7 10v4m5 2v4" />,
    support: <path d="M4 13v-2a8 8 0 0 1 16 0v2M4 13a2 2 0 0 0 2 2h1v-4H6a2 2 0 0 0-2 2Zm16 0a2 2 0 0 1-2 2h-1v-4h1a2 2 0 0 1 2 2Zm-3 2v1a3 3 0 0 1-3 3h-2" />,
    switch: <path d="M5 7h13l-3-3m3 3-3 3M19 17H6l3 3m-3-3 3-3" />,
    options: <path d="M5 4v16M5 8h7a4 4 0 0 1 4 4v8M16 12l3-3m-3 3 3 3" />,
    manage: <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" />,
  }

  return (
    <span className="why-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {icons[name]}
      </svg>
    </span>
  )
}

function ServerPromotionPage() {
  const promotionBenefits = [
    { number: '01', title: 'Earn from your reach', copy: 'Receive credit when your tracked audience visits Axiom and when referred customers purchase an eligible hosting service.' },
    { number: '02', title: 'Use one clear link', copy: 'Share a trackable link or button in your community, website, video descriptions, or social profiles.' },
    { number: '03', title: 'Build a real partnership', copy: 'Purchases carry more value than visits. Approved partners receive their exact rate and program terms before promoting Axiom.' },
  ]

  return (
    <main className="promotion-page">
      <section className="promotion-hero" aria-labelledby="promotion-title">
        <p className="promotion-eyebrow">Axiom partner program</p>
        <h1 id="promotion-title">Share Axiom. <span>Earn from your audience.</span></h1>
        <p className="promotion-intro">Promote Axiom Hosting through a tracked link or button. Approved partners can earn from qualified visits and hosting purchases generated by their community. This program promotes Axiom itself; it is not a place to advertise individual Minecraft servers.</p>
        <div className="promotion-actions">
          <HeroButton className="hero-button--primary" href="#partner-application">Join program</HeroButton>
          <HeroButton className="hero-button--secondary" href={discordInvite}>Join Discord</HeroButton>
        </div>
      </section>

      <section className="promotion-benefits" id="promotion-program" aria-labelledby="promotion-benefits-title">
        <div className="promotion-section-heading">
          <p>Why partner with us</p>
          <h2 id="promotion-benefits-title">Turn an established audience into recurring opportunity.</h2>
        </div>
        <div className="promotion-card-grid">
          {promotionBenefits.map((benefit) => (
            <article key={benefit.number}>
              <span>{benefit.number}</span>
              <h3>{benefit.title}</h3>
              <p>{benefit.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="partner-dashboard-section" aria-labelledby="partner-dashboard-title">
        <div className="promotion-section-heading">
          <p>Partner dashboard</p>
          <h2 id="partner-dashboard-title">Everything connected to one referral link.</h2>
        </div>
        <div className="partner-dashboard">
          <div className="partner-dashboard-top"><div><span>Program status</span><strong>Not enrolled</strong></div><span>Preview</span></div>
          <div className="partner-link-preview"><span>Your referral link</span><code>axiomhosting.com/?ref=your-name</code><button type="button" disabled>Copy link</button></div>
          <div className="partner-metrics" aria-label="Partner dashboard preview">
            <article><span>Qualified visits</span><strong>—</strong><small>Available after approval</small></article>
            <article><span>Hosting purchases</span><strong>—</strong><small>Available after approval</small></article>
            <article><span>Partner earnings</span><strong>—</strong><small>Rate confirmed on acceptance</small></article>
          </div>
          <div className="partner-product-status"><div><i aria-hidden="true" /><span><strong>Axiom Hosting</strong><small>Eligible now</small></span></div><div className="is-future"><i aria-hidden="true" /><span><strong>Axiom Launcher</strong><small>Planned for a future program update</small></span></div></div>
        </div>
      </section>

      <section className="partner-eligibility" aria-labelledby="partner-eligibility-title">
        <div><p className="promotion-eyebrow">Who can apply</p><h2 id="partner-eligibility-title">Bring an audience that trusts you.</h2><p>Applicants need at least one established community or social channel. Meeting a minimum does not guarantee acceptance; every application is reviewed individually.</p></div>
        <div className="partner-requirements"><article><strong>100+</strong><span>members in an active community</span></article><b>or</b><article><strong>1,000+</strong><span>followers or subscribers on a social account</span></article></div>
      </section>

      <section className="partner-application" id="partner-application" aria-labelledby="partner-application-title">
        <div className="promotion-section-heading"><p>Application</p><h2 id="partner-application-title">Partner applications are being prepared.</h2></div>
        <form className="partner-application-form" aria-disabled="true">
          <label>Name<input disabled /></label><label>Email<input type="email" disabled /></label><label className="partner-field-wide">Community or social link<input disabled /></label><label className="partner-field-wide">Tell us how you would promote Axiom<textarea rows="5" disabled /></label><button type="button" disabled>Send application</button>
          <div className="partner-application-lock">
            <svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M8 21h14l7 7-8 8H8l-6-7 6-8Zm34 7h14l6 8-7 7H42l-8-8 8-7Z" /><path d="m23 28 18 9" /><rect x="23" y="34" width="18" height="17" rx="4" /><path d="M27 34v-5a5 5 0 0 1 10 0v5" /></svg>
            <strong>Applications are locked for now</strong>
            <p>The email application will open when the partner program is ready. Join Discord for program updates.</p>
            <a href={discordInvite}>Join Discord <span aria-hidden="true">→</span></a>
          </div>
        </form>
      </section>
    </main>
  )
}

function ConfigurationFinder() {
  const [query, setQuery] = useState('')
  const searchTerms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const matches = searchTerms.length
    ? configurationSettings.filter((item) => {
      const searchable = `${item.title} ${item.location} ${item.setting} ${item.description} ${item.keywords}`.toLowerCase()
      return searchTerms.every((term) => searchable.includes(term))
    })
    : configurationSettings.slice(0, 6)

  return (
    <div className="configuration-finder">
      <label htmlFor="configuration-search">What do you want to change?</label>
      <div className="configuration-search-field">
        <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>
        <input
          id="configuration-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try render distance, difficulty, or player limit"
        />
      </div>
      <p className="configuration-finder-note">
        {searchTerms.length ? `${matches.length} matching setting${matches.length === 1 ? '' : 's'}` : 'Common settings'}
      </p>

      {matches.length > 0 ? (
        <div className="documentation-guide-grid configuration-results">
          {matches.map((item) => (
            <a href="/dashboard" key={item.title}>
              <span>{item.title}</span>
              <small>{item.location}</small>
              <code>{item.setting}</code>
              <p>{item.description}</p>
              <i aria-hidden="true">↗</i>
            </a>
          ))}
        </div>
      ) : (
        <div className="configuration-no-results">
          <h2>We could not find that setting.</h2>
          <p>It may belong to a plugin, mod, or a different server version. Contact us and tell us what you are trying to change so we can point you to the right place.</p>
          <a href="/support">Contact support <span aria-hidden="true">→</span></a>
        </div>
      )}

      <p className="configuration-restart-note">Stop the server before editing a file. Save the change, then restart the server so the new setting can load.</p>
    </div>
  )
}

function DocumentationPage({ pathname }) {
  const categorySlug = pathname.match(/^\/documents\/category\/([^/]+)/)?.[1] ?? ''
  const activeGroup = categorySlug
    ? documentationGroups.find((group) => getDocumentationGroupSlug(group.label) === categorySlug) ?? null
    : null
  const slug = categorySlug ? '' : pathname.replace(/^\/documents\/?/, '').split('/')[0]
  const activeDocument = documentationEntries.find((entry) => entry.slug === slug) ?? null
  const activeIndex = activeDocument ? documentationEntries.findIndex((entry) => entry.slug === activeDocument.slug) : -1
  const nextDocument = documentationEntries[activeIndex + 1] ?? documentationEntries[0]
  const currentGroupLabel = activeDocument?.group ?? activeGroup?.label ?? 'Start here'
  const [openGroups, setOpenGroups] = useState(() => new Set([currentGroupLabel]))
  const pageTitle = activeDocument?.title ?? activeGroup?.label ?? 'Minecraft server documentation'
  const pageSummary = activeDocument?.summary
    ?? (activeGroup
      ? `Choose a ${activeGroup.label.toLowerCase()} guide to get clear instructions for that task.`
      : 'Setup guides, optimization notes, modding help, and practical server-management references for Axiom Hosting.')

  const toggleDocumentationGroup = (label) => {
    setOpenGroups((current) => {
      const next = new Set(current)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  return (
    <main className="documentation-page">
      <div className="documentation-shell">
        <aside className="documentation-sidebar" aria-label="Documentation navigation">
          {documentationGroups.map((group) => {
            const groupSlug = getDocumentationGroupSlug(group.label)
            const isCurrent = currentGroupLabel === group.label

            if (group.items.length > 6) {
              return (
                <nav className={`documentation-nav-group${isCurrent ? ' is-current' : ''}`} key={group.label} aria-label={group.label}>
                  <a className={`documentation-group-link${activeGroup?.label === group.label ? ' is-active' : ''}`} href={`/documents/category/${groupSlug}`}>
                    <span>{group.label}</span>
                    <span aria-hidden="true">→</span>
                  </a>
                </nav>
              )
            }

            const isOpen = openGroups.has(group.label)
            const activeItemIndex = group.items.findIndex((item) => activeDocument?.slug === item.slug)
            return (
              <nav className={`documentation-nav-group${isCurrent ? ' is-current' : ''}`} key={group.label} aria-label={group.label}>
                <button
                  className="documentation-group-trigger"
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleDocumentationGroup(group.label)}
                >
                  <span>{group.label}</span>
                  <svg aria-hidden="true" viewBox="0 0 12 12"><path d="m3 4.5 3 3 3-3" /></svg>
                </button>
                <div className={`documentation-group-items${isOpen ? ' is-open' : ''}`}>
                  <div
                    className={activeItemIndex >= 0 ? 'has-active-item' : ''}
                    style={activeItemIndex >= 0 ? { '--active-path-height': `${24 + (activeItemIndex * 40)}px` } : undefined}
                  >
                    {group.items.map((item) => (
                      <a className={activeDocument?.slug === item.slug ? 'is-active' : ''} href={`/documents/${item.slug}`} key={item.slug}>
                        <span>{item.title}</span><span aria-hidden="true">›</span>
                      </a>
                    ))}
                  </div>
                </div>
              </nav>
            )
          })}
        </aside>

        <article className="documentation-article">
          <div className="documentation-article-top">
            <a href="/support">Need help? Contact support <span aria-hidden="true">→</span></a>
          </div>
          <h1>{pageTitle}</h1>
          <p className="documentation-summary">{pageSummary}</p>

          <div className="documentation-rule" />

          {activeDocument ? (
            <div className="documentation-content">
              {activeDocument.sections.map(([title, body, steps]) => (
                <section key={title}>
                  <h2>{title}</h2>
                  <p>{body}</p>
                  {steps && <div className="documentation-details">{steps.map((step) => <p key={step}>{step}</p>)}</div>}
                </section>
              ))}
              {activeDocument.commandGroups && (
                <div className="documentation-command-reference">
                  {activeDocument.commandGroups.map((group) => (
                    <section className="documentation-command-group" key={group.title}>
                      <h2>{group.title}</h2>
                      <p>{group.description}</p>
                      <dl>
                        {group.commands.map(([command, description]) => (
                          <div key={command}>
                            <dt><code>{command}</code></dt>
                            <dd>{description}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  ))}
                </div>
              )}
              {activeDocument.guideCards && (
                <div className="documentation-guide-grid">
                  {activeDocument.guideCards.map((guide) => (
                    <a href={guide.href} key={guide.href}>
                      <span>{guide.title}</span>
                      <p>{guide.copy}</p>
                      <i aria-hidden="true">↗</i>
                    </a>
                  ))}
                </div>
              )}
              {activeDocument.configurationFinder && <ConfigurationFinder />}
              {optimizationForms[activeDocument.slug] && (
                <a className="documentation-form-link" href={`/forms/optimization/${activeDocument.slug}`}>
                  Request this optimization review <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
          ) : activeGroup ? (
            <div className="documentation-guide-grid documentation-guide-grid--category">
              {activeGroup.items.map((guide) => (
                <a href={`/documents/${guide.slug}`} key={guide.slug}>
                  <span>{guide.title}</span>
                  <p>{guide.summary}</p>
                  <i aria-hidden="true">↗</i>
                </a>
              ))}
            </div>
          ) : (
            <div className="documentation-overview">
              <p>Use the sections on the left to find the guide you need.</p>
              <div>
                {documentationGroups.map((group) => (
                  <a href={group.items.length > 6 ? `/documents/category/${getDocumentationGroupSlug(group.label)}` : `/documents/${group.items[0].slug}`} key={group.label}>
                    <span>{group.label}</span>
                    <strong>{group.items.length} guides</strong>
                    <i aria-hidden="true">↗</i>
                  </a>
                ))}
              </div>
            </div>
          )}

          {activeDocument && (
            <footer className="documentation-next">
              <span>Next</span>
              <a href={`/documents/${nextDocument.slug}`}>{nextDocument.title} <span aria-hidden="true">→</span></a>
            </footer>
          )}
        </article>
      </div>
    </main>
  )
}

function PublicSupportPage() {
  const [status, setStatus] = useState('')
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL

  const submitTicket = (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    if (!supportEmail) {
      setStatus('Support email is not configured yet. Please join Discord for help.')
      return
    }
    const subject = encodeURIComponent(`[Support] ${data.get('subject')}`)
    const body = encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\nServer: ${data.get('server') || 'Not provided'}\n\n${data.get('message')}`)
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`
  }

  return (
    <main className="public-info-page support-page">
      <header className="public-page-hero">
        <h1>Tell us what you need help with.</h1>
        <p>Share the problem, what you expected to happen, and any error message you received.</p>
      </header>
      <div className="support-page-layout">
        <form className="public-ticket-form" onSubmit={submitTicket}>
          <div className="public-form-field"><label htmlFor="support-name">Name</label><input id="support-name" name="name" autoComplete="name" required /></div>
          <div className="public-form-field"><label htmlFor="support-email">Email</label><input id="support-email" name="email" type="email" autoComplete="email" required /></div>
          <div className="public-form-field"><label htmlFor="support-server">Server name <span>Optional</span></label><input id="support-server" name="server" /></div>
          <div className="public-form-field"><label htmlFor="support-subject">Subject</label><input id="support-subject" name="subject" required /></div>
          <div className="public-form-field public-form-field--wide"><label htmlFor="support-message">What happened?</label><textarea id="support-message" name="message" rows="7" required /></div>
          <button type="submit">Create support ticket <span aria-hidden="true">→</span></button>
          {status && <p className="public-form-status" aria-live="polite">{status}</p>}
        </form>
      </div>
    </main>
  )
}

function LegalPage() {
  return (
    <main className="public-info-page legal-page">
      <header className="public-page-hero">
        <span>Legal</span>
        <h1>Terms for every Axiom service.</h1>
        <p>Review the rules for Axiom Hosting, the Axiom Launcher, and the terms that apply across both services.</p>
      </header>
      <div className="legal-page-layout">
        <nav aria-label="Legal sections"><a href="#hosting-terms">Hosting</a><a href="#launcher-terms">Launcher</a><a href="#universal-terms">Universal</a></nav>
        <div className="legal-copy">
          <section id="hosting-terms"><h2>Hosting terms</h2><p>You are responsible for activity on your Minecraft server, the files you upload, and keeping your account secure. Hosting may not be used for unlawful activity, attacks, malware, unauthorized access, abuse, or content that violates another person’s rights.</p><p>Payments are due for the billing period selected at checkout. Plans, available resources, and service features may change. A service may be limited or suspended when payment is overdue, it is being abused, or its operation could harm customers or infrastructure. Keep your own current backups before transfers, updates, or major configuration changes.</p></section>
          <section id="launcher-terms"><h2>Launcher terms</h2><p>The Axiom Launcher is provided for personal use with Minecraft versions, modpacks, and supported Axiom services. Do not copy, resell, reverse engineer, misuse, or distribute the launcher in a way that violates applicable law or another person’s rights.</p><p>Minecraft, mods, modpacks, and other third-party files remain the property of their respective owners. You are responsible for using content you have permission to download. Updates may change compatibility, supported features, or system requirements, and you should protect important worlds and files before making changes.</p></section>
          <section id="universal-terms"><h2>Universal terms</h2><p>These rules apply to every Axiom service. Provide accurate account information, protect your login details, and use the platform responsibly. You keep ownership of content you submit, but you must have permission to use it.</p><p>We collect information needed to create accounts, process orders, provide support, secure services, and maintain reliability. This may include contact details, billing records, service configuration, and technical logs. We do not sell personal information. Information may be shared with infrastructure, payment, security, and communication providers only when needed to operate the service or meet legal obligations.</p><p>Terms, features, and availability may be updated as services change. If you have a privacy, billing, launcher, or hosting question, contact the support team using the email address connected to your account.</p><a href="/support">Contact support <span aria-hidden="true">→</span></a></section>
        </div>
      </div>
    </main>
  )
}

function ServerListsPage() {
  return (
    <main className="public-page">
      <header className="public-page-hero">
        <span>Server lists</span>
        <h1>Share and discover Minecraft communities.</h1>
        <p>Server listing options help communities make their Minecraft server easier for new players to find.</p>
      </header>
      <section className="public-page-body">
        <div className="legal-layout">
          <nav aria-label="Server list information"><a href="#listings">Server listings</a><a href="#help">Get help</a></nav>
          <div className="legal-copy">
            <section id="listings"><h2>Server listings</h2><p>Axiom is preparing a clear place for communities to share their Minecraft servers. Listing requirements and submission details will be shown here when they are available.</p></section>
            <section id="help"><h2>Questions about a listing?</h2><p>Send the support team your server name, community link, and a short explanation of what you want to list.</p><a href="/support">Open a support ticket <span aria-hidden="true">→</span></a></section>
          </div>
        </div>
      </section>
    </main>
  )
}

function SiteFooter({ language, setLanguage }) {
  const t = (text) => translate(language, text)

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <a href="/" aria-label="Axiom Hosting home"><img src={axiomHostingWordmark} alt="AxiomHosting" /></a>
          <p>Minecraft server hosting for private worlds, communities, and modpacks.</p>
        </div>

        <div className="footer-links">
          <div>
            <h2>{t('Products')}</h2>
            <a href="/packages/configure/minecraft-bee">Bee Plan</a>
            <a href="/packages/configure/minecraft-wolf">Wolf Plan</a>
            <a href="/packages/configure/minecraft-blaze">Blaze Plan</a>
            <a href="/packages/configure/minecraft-warden">Warden Plan</a>
          </div>
          <div>
            <h2>{t('Programs')}</h2>
            <a href="/programs/promotion">Partner Program</a>
            <a href="/programs/promotion#promotion-program">Promotion Program</a>
          </div>
          <div>
            <h2>More info</h2>
            <a href="/support">Support Ticket</a>
            <a href="/server-lists">Server Lists</a>
            <a href="/legal">Legal</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Axiom Hosting</span>
        <div className="footer-bottom-actions">
          <HeroButton className="hero-button--secondary footer-discord-button" href={discordInvite}>
            <DiscordIcon />
            Join Discord
          </HeroButton>
          <div className="footer-legal">
            <a href="/legal#privacy">{t('Privacy')}</a>
            <a href="/legal#terms">{t('Terms')}</a>
            <LanguagePicker language={language} setLanguage={setLanguage} />
          </div>
        </div>
      </div>
    </footer>
  )
}

function App() {
  const pathname = getAppPathname()
  const [language, setLanguage] = useState(getPreferredLanguage)
  const [pricingCycle, setPricingCycle] = useState('monthly')
  const t = (text) => translate(language, text)
  const launcherDownload = import.meta.env.VITE_LAUNCHER_DOWNLOAD_URL
  const activeBillingCycle = billingCycles.find((cycle) => cycle.id === pricingCycle) ?? billingCycles[1]

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  if (pathname === '/support' || pathname === '/dashboard/support') {
    return (
      <>
        <Navigation language={language} />
        <PublicSupportPage />
      </>
    )
  }

  if (pathname === '/legal') {
    return (
      <>
        <Navigation language={language} />
        <LegalPage />
        <SiteFooter language={language} setLanguage={setLanguage} />
      </>
    )
  }

  if (pathname === '/server-lists') {
    return (
      <>
        <Navigation language={language} />
        <ServerListsPage />
        <SiteFooter language={language} setLanguage={setLanguage} />
      </>
    )
  }

  if (pathname.startsWith('/dashboard')) {
    return <Dashboard pathname={pathname} language={language} setLanguage={setLanguage} />
  }

  if (pathname.startsWith('/services') || pathname.startsWith('/packages')) {
    return (
      <>
        <Navigation language={language} />
        <PublicStore pathname={pathname} footer={<SiteFooter language={language} setLanguage={setLanguage} />} />
      </>
    )
  }

  if (pathname === '/launcher') {
    const launcherReasons = [
      { title: 'Keep modpacks organized', copy: 'Keep the packs you play in one clear library instead of sorting through scattered folders.', icon: 'manage' },
      { title: 'Choose the right version', copy: 'See which Minecraft version belongs to each setup so you can launch the right game with less guesswork.', icon: 'switch' },
      { title: 'Simpler mod management', copy: 'Add, review, and remove mods from a cleaner interface built around the way Minecraft players set up their game.', icon: 'options' },
      { title: 'Your servers close by', copy: 'Keep your Axiom Minecraft servers near the versions and modpacks you use to join them.', icon: 'axiom' },
      { title: 'One familiar place', copy: 'Spend less time searching for files and settings, and more time getting into your world.', icon: 'control' },
    ]

    return (
      <>
        <Navigation language={language} />
        <main className="launcher-page">
          <section className="launcher-page-hero" aria-labelledby="launcher-page-title">
            <span>Axiom Launcher</span>
            <h1 id="launcher-page-title">Download the launcher.</h1>
            <p>Bring your Minecraft versions, modpacks, and Axiom servers together in one simple app.</p>
            {launcherDownload ? <a className="launcher-download-button" href={launcherDownload}>Download for Windows <span aria-hidden="true">↓</span></a> : <span className="launcher-download-button is-disabled">Download coming soon</span>}
          </section>

          <section className="launcher-preview-section" id="about" aria-labelledby="launcher-preview-title">
            <div className="launcher-preview-heading">
              <span>One place to play</span>
              <h2 id="launcher-preview-title">Meet Axiom Launcher.</h2>
              <p>A focused desktop app that keeps the parts of your Minecraft setup together and easy to find.</p>
            </div>
            <div className="macbook-frame macbook-frame--page">
              <div className="launcher-window launcher-window--page" aria-label="Launcher preview">
                <div className="launcher-window-bar" aria-hidden="true"><i /><i /><i /></div>
                <div className="launcher-window-empty" />
              </div>
            </div>
          </section>

          <section className="why-us launcher-reasons" aria-label="Why use Axiom Launcher">
            <div className="why-us-grid">
              <article className="why-intro">
                <h3>Why <span className="section-title-muted">the launcher</span></h3>
                <p>A simpler way to keep the Minecraft setups you use organized and ready.</p>
              </article>
              {launcherReasons.map((reason) => (
                <article key={reason.title}>
                  <h3>{reason.title}</h3>
                  <p>{reason.copy}</p>
                  <WhyIcon name={reason.icon} />
                </article>
              ))}
            </div>
          </section>
        </main>
        <SiteFooter language={language} setLanguage={setLanguage} />
      </>
    )
  }

  if (pathname === '/programs/promotion') {
    return (
      <>
        <Navigation language={language} />
        <ServerPromotionPage />
        <SiteFooter language={language} setLanguage={setLanguage} />
      </>
    )
  }


  if (pathname.startsWith('/documents')) {
    return (
      <>
        <Navigation language={language} />
        <DocumentationPage pathname={pathname} />
        <SiteFooter language={language} setLanguage={setLanguage} />
      </>
    )
  }

  if (pathname !== '/') return null

  return (
    <>
      <Navigation language={language} />
      <main>
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-content">
            <h1 id="hero-title">
              <img src={axiomHostingWordmark} alt="AxiomHosting" />
            </h1>
            <p>Fast Minecraft hosting for every world, community, and modpack.</p>
            <div className="hero-actions">
              <HeroButton className="hero-button--primary hero-button--calm" href="/packages">{t('Get started')}</HeroButton>
              <HeroButton className="hero-button--secondary hero-button--calm" href={discordInvite}>
                <DiscordIcon />
                Join Discord
              </HeroButton>
            </div>
          </div>
        </section>

        <section className="why-us why-us--home" id="why-axiom" aria-label="Axiom Hosting features">
          <header className="why-us-intro">
            <h2>Run your server without hunting through the panel.</h2>
            <p>Versions, files, console access, transfers, and support stay close to the server they belong to.</p>
          </header>
          <div className="why-us-list">
            <article><h3>Server control</h3><p>Change versions, check resources, open the console, and manage the server from one clear workspace.</p></article>
            <article><h3>Help from people who know Minecraft</h3><p>Get practical help with resource choices, plugins, modpacks, errors, and world transfers.</p></article>
            <article><h3>World transfers</h3><p>Bring an existing server or Minecraft world to Axiom without starting again.</p></article>
            <article><h3>Resources you can understand</h3><p>Choose the CPU, RAM, NVMe storage, version, and region that match how your server is used.</p></article>
            <article><h3>One account for the whole server</h3><p>Keep hosting, billing, console access, backups, and support connected to the same server.</p></article>
          </div>
        </section>

        <section className="content-section pricing-section" aria-labelledby="pricing-title">
          <div className="section-heading">
            <h2 id="pricing-title">Pricing</h2>
            <p>Choose a package for your world.</p>
          </div>
          <div className="home-billing-cycle" aria-label="Billing cycle" style={{ '--active-index': billingCycles.findIndex((cycle) => cycle.id === pricingCycle) }}>
            {billingCycles.map((cycle) => (
              <button className={pricingCycle === cycle.id ? 'is-active' : ''} type="button" key={cycle.id} onClick={() => setPricingCycle(cycle.id)} aria-pressed={pricingCycle === cycle.id}>
                <span>{cycle.label}</span>{cycle.saving && <small>{cycle.saving}</small>}
              </button>
            ))}
          </div>
          <div className="pricing-grid">
            {homepagePlans.map((plan) => (
              <article className={`pricing-card${plan.featured ? ' pricing-card--featured' : ''}`} key={plan.id}>
                {plan.featured && <span className="featured-label">Most popular</span>}
                <div className="plan-heading"><MobPlanIcon name={plan.icon} /><div><h3>{plan.name}</h3><p>{plan.note}</p></div></div>
                <p className="plan-price"><strong>${(plan.monthlyPrice * activeBillingCycle.multiplier).toFixed(activeBillingCycle.id === 'monthly' ? 0 : 2)}</strong><small>{activeBillingCycle.suffix}</small></p>
                <div className="plan-value-summary"><span>${plan.monthlyPrice}/month</span><span>${getBundleDiscount(plan).normalValue.toFixed(2)} normal value</span><strong>Save ${getBundleDiscount(plan).dollars.toFixed(2)} · {Math.round(getBundleDiscount(plan).percentage)}%</strong></div>
                <div className="plan-divider" />
                <ul className="plan-features"><li>{plan.ram} GB RAM</li><li>{plan.cpu} CPU {plan.cpu === 1 ? 'thread' : 'threads'}</li><li>{plan.storage} GB NVMe storage</li><li>Ideal for up to {plan.playerGuide} players</li></ul>
                <a href={`/packages/configure/${plan.id}`}>{t('Get started')}</a>
              </article>
            ))}
          </div>
          <a className="view-all-plans" href="/packages">More options <span aria-hidden="true">→</span></a>
        </section>

        <section className="content-section launcher-section" id="launcher" aria-labelledby="launcher-title">
          <div className="launcher-panel">
            <div className="launcher-copy">
              <h2 id="launcher-title">Download our mod launcher.</h2>
              <p>Keep modpacks, versions, and Axiom Minecraft servers together in one launcher.</p>
              <div className="launcher-actions">
                {launcherDownload ? <a className="launcher-action launcher-action--primary" href={launcherDownload}>Download <span aria-hidden="true">↓</span></a> : <a className="launcher-action launcher-action--primary" href="/launcher">Download <span aria-hidden="true">→</span></a>}
                <a className="launcher-action launcher-action--secondary" href="/launcher#about">Learn more <span aria-hidden="true">→</span></a>
              </div>
            </div>
            <div className="macbook-frame">
              <div className="launcher-window" aria-label="Launcher preview">
                <div className="launcher-window-bar" aria-hidden="true"><i /><i /><i /></div>
                <div className="launcher-window-empty" />
              </div>
            </div>
          </div>
        </section>

        <section className="content-section family-section" aria-labelledby="family-title">
          <div className="section-heading"><h2 id="family-title">See our <span className="section-title-muted">sister companies.</span></h2><p>Two focused Axiom companies built for cloud gaming and business infrastructure.</p></div>
          <div className="family-grid">
            <article className="family-card is-locked"><span className="family-lock" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg></span><h3><img src={axiomCloudWordmark} alt="AxiomCloud" /></h3><p>Modded cloud gaming built around managed game libraries and remote play.</p></article>
            <article className="family-card is-locked"><span className="family-lock" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg></span><h3><img src={axiomHostingWordmark} alt="AxiomHosting" /></h3><p>Business infrastructure for VPS, websites, applications, and enterprise hosting.</p></article>
          </div>
        </section>

      </main>

      <SiteFooter language={language} setLanguage={setLanguage} />
    </>
  )
}

export default App
