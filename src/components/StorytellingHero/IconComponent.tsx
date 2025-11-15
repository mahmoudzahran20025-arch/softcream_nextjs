'use client'

import { Zap, ShieldCheck, Activity, Brain, Award, Scale } from 'lucide-react'
import type { IconName } from './data/stories'

interface IconComponentProps {
  name: IconName
  className?: string
  iconColor?: string
}

const ICON_MAP: Record<IconName, typeof Zap> = {
  Zap,
  ShieldCheck,
  Activity,
  Brain,
  Award,
  Scale,
}

export default function IconComponent({ name, className, iconColor }: IconComponentProps) {
  const Icon = ICON_MAP[name]

  return <Icon className={className} style={iconColor ? { color: iconColor } : undefined} />
}
