import {
  HeroHybrid,
  QuickTools,
  WhyCodex,
  Roadmap,
  UpdatesThisWeek,
  ExploreCodex,
  GuidesTeaser,
} from '@/components/sections'

export default function Home() {
  return (
    <div className="-mx-4 -my-6">
      <HeroHybrid />
      <QuickTools />
      <WhyCodex />
      <Roadmap />
      <UpdatesThisWeek />
      <ExploreCodex />
      <GuidesTeaser />
    </div>
  )
}
