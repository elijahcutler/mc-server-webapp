import Navbar from "@/components/navbar"
import ServerStatus from "@/components/server-status"
import ModList from "@/components/mod-list"
import ServerInfo from "@/components/server-info"
import CommunitySection from "@/components/community-section"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-12">
            {/* Server Status Section */}
            <section id="server-status">
              <ServerStatus />
            </section>

            {/* Server Info Section */}
            <section id="server-info">
              <ServerInfo />
            </section>

            {/* Mod List Section */}
            <section id="mod-list">
              <ModList />
            </section>

            {/* Community Section */}
            <section id="community">
              <CommunitySection />
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

