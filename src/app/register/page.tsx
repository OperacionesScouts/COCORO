"use client"
import { useState } from 'react';
import { AppNavbar } from '@/components/AppNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';
import { saveParticipant } from '@/lib/store';
import { Upload, CheckCircle2, Landmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserType } from '@/lib/types';

const SCOUT_GROUPS = [
  "ARISTIDES ROJAS",
  "BICENTENARIO",
  "DON BOSCO 21",
  "HENRI PITTIER",
  "LA SALLE LA COLINA",
  "NEPTUNO"
];

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  
  const [scoutGroup, setScoutGroup] = useState<string>("");
  const [userType, setUserType] = useState<UserType>("Joven");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.onerror = (err) => {
        console.error("Error reading file:", err);
        toast({ title: 'Error', description: 'No se pudo leer el archivo seleccionado.', variant: 'destructive' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!scoutGroup) {
      toast({ title: 'Error', description: 'Por favor selecciona tu Grupo Scout.', variant: 'destructive' });
      return;
    }
    
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const rawAmount = formData.get('amount') as string;
    // Handle comma as decimal separator by replacing it with a dot before parsing
    const parsedAmount = parseFloat(rawAmount.replace(',', '.'));

    if (isNaN(parsedAmount)) {
      toast({ title: 'Error', description: 'El monto ingresado no es válido.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    const data = {
      fullName: formData.get('fullName') as string,
      dni: formData.get('dni') as string,
      email: formData.get('email') as string,
      scoutGroup: scoutGroup,
      userType: userType,
      bankReference: formData.get('bankReference') as string,
      paymentDate: formData.get('paymentDate') as string,
      amount: parsedAmount,
    };

    if (!receiptPreview) {
      toast({ title: 'Error', description: 'Por favor adjunta el comprobante de pago.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    const newParticipant = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      receiptUrl: receiptPreview,
      status: 'pending' as const,
      membershipStatus: 'inactive' as const,
      attendance: 'absent' as const,
    };

    // Simulate network delay
    setTimeout(() => {
      saveParticipant(newParticipant);
      setIsSubmitting(false);
      setIsSuccess(true);
      toast({ title: 'Registro exitoso', description: 'Tus datos han sido enviados para validación.' });
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppNavbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center py-12">
            <CardContent className="space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h2 className="text-2xl font-bold">¡Registro Recibido!</h2>
              <p className="text-muted-foreground">
                Hemos recibido tus datos. Ahora deben ser validados el Pago y la Membresía para obtener tu QR.
              </p>
              <Button onClick={() => router.push('/status')} className="bg-primary w-full">
                Consultar Mi Estatus
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppNavbar />
      <main className="flex-1 container mx-auto max-w-2xl py-12 px-4">
        <Card className="shadow-xl">
          <CardHeader className="bg-primary text-white rounded-t-lg">
            <CardTitle className="text-2xl">Registro al Evento</CardTitle>
            <CardDescription className="text-white/70">Ingresa tus datos personales y de pago para inscribirte.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre y Apellido</Label>
                  <Input id="fullName" name="fullName" required placeholder="Ej: Robert Baden-Powell" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dni">Número de Cédula / ID</Label>
                  <Input id="dni" name="dni" required placeholder="Ej: 12.345.678" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" name="email" type="email" required placeholder="correo@ejemplo.com" />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Participante</Label>
                  <Select onValueChange={(v) => setUserType(v as UserType)} defaultValue="Joven">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Joven">Joven</SelectItem>
                      <SelectItem value="Adulto">Adulto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Grupo Scout</Label>
                <Select onValueChange={setScoutGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu Grupo Scout" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCOUT_GROUPS.map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 text-primary">Información de Pago</h3>
                
                {/* Bank Details Section */}
                <div className="bg-muted/50 p-4 rounded-lg mb-6 border-l-4 border-primary space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold mb-1">
                    <Landmark className="h-4 w-4" />
                    <h4>Datos para transferencia:</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <p><strong>Banco:</strong> X</p>
                    <p><strong>RIF:</strong> J-000666652</p>
                    <p><strong>Cuenta:</strong> XXXXX</p>
                    <p><strong>Monto:</strong> 15 USD (A tasa BCV del día)</p>
                    <p className="sm:col-span-2"><strong>Beneficiario:</strong> Asociación de Scouts de Venezuela</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankReference">Referencia Bancaria</Label>
                    <Input id="bankReference" name="bankReference" required placeholder="Número de transacción" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentDate">Fecha de Pago</Label>
                    <Input id="paymentDate" name="paymentDate" type="date" required />
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <Label htmlFor="amount">Monto Pagado (Bs)</Label>
                  <Input 
                    id="amount" 
                    name="amount" 
                    type="text" 
                    inputMode="decimal"
                    required 
                    placeholder="0,00" 
                    title="Usa la coma (,) como separador decimal"
                  />
                  <p className="text-[10px] text-muted-foreground italic">Usa la coma (,) como separador decimal (ej: 1250,50)</p>
                </div>

                <div className="mt-6 space-y-2">
                  <Label>Adjuntar Comprobante</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      required
                    />
                    {receiptPreview ? (
                      <div className="space-y-2">
                        <img src={receiptPreview} alt="Comprobante" className="max-h-40 mx-auto rounded shadow-sm" />
                        <p className="text-sm text-primary font-medium">Click para cambiar imagen</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">Haz click o arrastra una imagen aquí</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary text-white hover:bg-primary/90 h-12 text-lg font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Confirmar Registro'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
