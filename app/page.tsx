import Navbar from "@/components/navbar"
import ServerStatus from "@/components/server-status"
import ModList from "@/components/mod-list"
import ServerInfo from "@/components/server-info"
import CommunitySection from "@/components/community-section"
import Footer from "@/components/footer"
import SectionHeader from "@/components/section-header"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-12">
            {/* Server Status Section */}
            <section>
              <SectionHeader
                id="server-status"
                title="Server Status"
                description="Check if the server is online and who's playing"
              />
              <div className="mt-4">
                <ServerStatus />
              </div>
            </section>

            {/* Server Info Section */}
            <section>
              <SectionHeader
                id="server-info"
                title="Server Information"
                description="Everything you need to know to join the server"
              />
              <div className="mt-4">
                <ServerInfo />
              </div>
            </section>

            {/* Mod List Section */}
            <section>
              <SectionHeader
                id="mod-list"
                title="Mod List"
                description="Explore the mods that power our server experience"
              />
              <div className="mt-4">
                <ModList />
              </div>
            </section>

            {/* Community Section */}
            <section>
              <SectionHeader id="community" title="Purpose" description="The lore of the server" />
              <div className="mt-4">
                <CommunitySection />
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

