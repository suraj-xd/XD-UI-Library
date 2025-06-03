"use client"

import { ShowcaseLayout } from "@/components/showcase-layout"
import { showcaseComponents } from "@/lib/showcase-components"

export default function HomePage() {
  return (

    <ShowcaseLayout
      // pageTitle is handled by Header now
      components={showcaseComponents} // You can pass specific components here
      githubUrl="https://github.com/suraj-xd" // Replace with your GitHub URL
      twitterUrl="https://twitter.com/notsurajgaud" // Replace with your Twitter URL
    />
  )
}
