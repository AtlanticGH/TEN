import {
  IconBeaker,
  IconBolt,
  IconGlobe,
  IconMic,
  IconUsers,
} from '../components/home/homeContentData.jsx'

export const PROGRAM_CARD_ICONS = {
  beaker: IconBeaker,
  bolt: IconBolt,
  mic: IconMic,
  users: IconUsers,
  globe: IconGlobe,
}

export function programCardIcon(iconId) {
  return PROGRAM_CARD_ICONS[iconId] || IconBeaker
}
