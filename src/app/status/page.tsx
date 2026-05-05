"use client"
import { useState } from 'react';
import { AppNavbar } from '@/components/AppNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { findParticipantByDni } from '@/lib/store';
import { Participant } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Search, Clock, CheckCircle2, Download, ShieldAlert } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const statusTranslations: Record<string, string> = {
  pending: 'Pendiente',
  validated: 'Validado',
  rejected: 'Rechazado'
};

export default function StatusPage() {
  const [dniInput, setDniInput] = useState('');
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const result = findParticipantByDni(dniInput.trim());
    setParticipant(result || null);
    setHasSearched(true);
  };

  const isFullyValidated = participant?.status === 'validated' && participant?.membershipStatus === 'active';

  const downloadQR = () => {
    try {
      const svg = document.getElementById('qr-code-svg');
      if (!svg) {
        console.error("QR SVG element not found");
        return;
      }
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        try {
          canvas.width = img.width;
          canvas.height = img.height;
          if (ctx) {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          }
          const downloadLink = document.createElement("a");
          downloadLink.download = `Pase_Congreso_${participant?.dni}.png`;
          downloadLink.href = canvas.toDataURL("image/png");
          downloadLink.click();
        } catch (err) {
          console.error("Error processing QR image canvas:", err);
        }
      };
      img.onerror = (err) => {
        console.error("Error loading image from SVG data:", err);
      };
      // Use encodeURIComponent to handle non-ASCII characters in SVG
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      console.error("Error generating QR for download:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppNavbar />
      <main className="flex-1 container mx-auto max-w-xl py-12 px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary">Consulta tu Estatus</h1>
        
        <form onSubmit={handleSearch} className="mb-10 flex gap-2">
          <Input 
            placeholder="Ingresa tu cédula..." 
            value={dniInput}
            onChange={(e) => setDniInput(e.target.value)}
            className="flex-1 h-12 shadow-sm"
            required
          />
          <Button type="submit" className="h-12 bg-primary px-6">
            <Search className="h-4 w-4 mr-2" /> Buscar
          </Button>
        </form>

        {hasSearched && participant ? (
          <Card className="overflow-hidden shadow-xl border-t-4 border-t-primary animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                {isFullyValidated ? (
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                ) : (
                  <ShieldAlert className="h-12 w-12 text-amber-500" />
                )}
              </div>
              <CardTitle className="text-2xl">{participant.fullName}</CardTitle>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <Badge variant={participant.status === 'validated' ? 'default' : 'secondary'} className={participant.status === 'validated' ? 'bg-green-600' : ''}>
                  Pago: {statusTranslations[participant.status] || participant.status}
                </Badge>
                <Badge variant={participant.membershipStatus === 'active' ? 'default' : 'secondary'} className={participant.membershipStatus === 'active' ? 'bg-blue-600' : ''}>
                  Membresía ASV: {participant.membershipStatus === 'active' ? 'Activa' : 'En Verificación'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                <div className="text-muted-foreground">ID:</div>
                <div className="font-semibold">{participant.dni}</div>
                <div className="text-muted-foreground">Grupo:</div>
                <div className="font-semibold">{participant.scoutGroup}</div>
                <div className="text-muted-foreground">Monto:</div>
                <div className="font-semibold">Bs. {participant.amount.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</div>
              </div>

              {isFullyValidated ? (
                <div className="mt-8 p-6 bg-primary/5 rounded-xl border-2 border-primary border-dashed text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg shadow-inner flex items-center justify-center">
                      <QRCodeSVG 
                        id="qr-code-svg"
                        value={participant.id} 
                        size={200}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary uppercase">Código de Acceso Autorizado</p>
                    <p className="text-xs text-muted-foreground">Presenta este código al llegar al Distrito Ávila.</p>
                  </div>
                  <Button onClick={downloadQR} className="w-full bg-primary text-white font-bold h-12">
                    <Download className="mr-2 h-4 w-4" /> Descargar Pase Digital
                  </Button>
                </div>
              ) : (
                <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 text-amber-800 space-y-3">
                  <div className="flex items-center gap-2 font-bold">
                    <Clock className="h-5 w-5" /> Pendiente de Verificación
                  </div>
                  <p className="text-sm">
                    Para visualizar tu código QR de acceso, ambos requisitos deben estar validados:
                  </p>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    <li className={participant.status === 'validated' ? 'text-green-700 font-bold' : ''}>
                      Pago del Evento: {statusTranslations[participant.status] === 'Validado' ? 'LISTO' : 'PENDIENTE'}
                    </li>
                    <li className={participant.membershipStatus === 'active' ? 'text-green-700 font-bold' : ''}>
                      Membresía ASV: {participant.membershipStatus === 'active' ? 'LISTO' : 'EN VERIFICACIÓN'}
                    </li>
                  </ul>
                  <p className="text-xs italic pt-2 border-t border-amber-200">
                    Si ya realizaste todo, el equipo administrativo y de operaciones actualizarán tu estatus en breve.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : hasSearched && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border space-y-4">
            <ShieldAlert className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
            <p className="text-muted-foreground">Cédula <strong>{dniInput}</strong> no encontrada.</p>
            <Button variant="outline" asChild><a href="/register">Ir a Registro</a></Button>
          </div>
        )}
      </main>
    </div>
  );
}
