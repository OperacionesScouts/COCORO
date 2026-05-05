import { AppNavbar } from '@/components/AppNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { UserPlus, ShieldCheck, QrCode, Search } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppNavbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary py-16 md:py-24 px-4 text-center">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Bienvenido a <span className="text-white font-extrabold">COCORO</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              La webapp oficial para el registro, validación y control de asistencia de nuestro <strong>Congreso de Comunidad Rover - Distrito Ávila 2026</strong>. Organización, confianza y fraternidad en cada paso del camino.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold px-8 h-14 text-lg">
                <Link href="/register">Registrarme Ahora</Link>
              </Button>
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold px-8 h-14 text-lg">
                <Link href="/status">Consultar mi Estatus</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="shadow-lg border-none hover:translate-y-[-4px] transition-transform bg-muted/30">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-primary">Registro Ágil</CardTitle>
                  <CardDescription>Completa tus datos y adjunta tu comprobante en minutos.</CardDescription>
                </CardHeader>
              </Card>

              <Card className="shadow-lg border-none hover:translate-y-[-4px] transition-transform bg-muted/30">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-primary">QR Único</CardTitle>
                  <CardDescription>Una vez validado, obtendrás tu pase digital único para el Congreso.</CardDescription>
                </CardHeader>
              </Card>

              <Card className="shadow-lg border-none hover:translate-y-[-4px] transition-transform bg-muted/30">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-primary">Validación Segura</CardTitle>
                  <CardDescription>Nuestro equipo garantiza la transparencia y orden del proceso.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Access Shortcuts */}
        <section className="py-16 bg-muted/30 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12 text-primary">Accesos del Staff</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Link href="/admin" className="group">
                <div className="bg-white p-6 rounded-xl shadow-md border border-border group-hover:border-primary transition-all flex items-center space-x-4">
                  <div className="bg-primary text-white p-3 rounded-lg">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary">Administración</h3>
                    <p className="text-sm text-muted-foreground">Validar pagos y gestionar participantes.</p>
                  </div>
                </div>
              </Link>
              <Link href="/ops" className="group">
                <div className="bg-white p-6 rounded-xl shadow-md border border-border group-hover:border-primary transition-all flex items-center space-x-4">
                  <div className="bg-primary text-white p-3 rounded-lg">
                    <Search className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary">Operaciones</h3>
                    <p className="text-sm text-muted-foreground">Control de acceso y asistencia.</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-white/70 py-8 px-4 border-t border-white/10">
        <div className="container mx-auto text-center">
          <p className="font-medium">© 2026 COCORO - Distrito Ávila. Siempre Listos para Servir.</p>
        </div>
      </footer>
    </div>
  );
}
