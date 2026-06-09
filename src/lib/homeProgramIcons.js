import {
  IconBeaker,
  IconBolt,
  IconGlobe,
  IconMic,
  IconUsers,
} from '../components/home/homeContentData.jsx'

export const HOME_PROGRAM_ICON_OPTIONS = [
  { id: 'beaker', label: 'Ignition Labs (beaker)' },
  { id: 'bolt', label: 'Spark Challenge (bolt)' },
  { id: 'mic', label: 'Fireside Dialogues (mic)' },
  { id: 'users', label: 'Founder Mastermind (users)' },
  { id: 'globe', label: 'Impact Ventures (globe)' },
]

const ICON_MAP = {
  beaker: IconBeaker,
  bolt: IconBolt,
  mic: IconMic,
  users: IconUsers,
  globe: IconGlobe,
}

export function resolveProgramIcon(iconId) {
  return ICON_MAP[iconId] || IconBeaker
}
