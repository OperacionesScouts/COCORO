
"use client"
import { useState, useEffect, useRef } from 'react';
import { AppNavbar } from '@/components/AppNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getParticipants, markAttendance, findParticipantById, updateMembershipStatus } from '@/lib/store';
import { Participant } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { QrCode, User, Lock, Download, Camera, X, ClipboardList, Award, Check, Clock, Users, UserCheck, UserMinus, AlertCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const statusTranslations: Record<string, string> = {
  pending: 'Pendiente',
  validated: 'Validado',
  rejected: 'Rechazado'
};

export default function OperationsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filter, setFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [lastScanned, setLastScanned] = useState<Participant | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  const scannerInstance = useRef<Html5Qrcode | null>(null);
  const scannerId = "qr-reader-element";

  const refreshData = () => {
    const data = getParticipants();
    setParticipants([...data]);
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerInstance.current && scannerInstance.current.isScanning) {
        scannerInstance.current.stop().catch(err => console.error("Error stopping scanner", err));
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      // First, check if we have permission/cameras
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        toast({ title: 'Error', description: 'No se detectaron cámaras.', variant: 'destructive' });
        return;
      }

      setHasCameraPermission(true);
      setShowScanner(true);

      // Give React a moment to render the scanner container if it wasn't visible
      setTimeout(async () => {
        try {
          if (scannerInstance.current?.isScanning) {
            await scannerInstance.current.stop();
          }

          const html5QrCode = new Html5Qrcode(scannerId);
          scannerInstance.current = html5QrCode;
          
          const config = { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          };
          
          await html5QrCode.start(
            { facingMode: "environment" }, 
            config, 
            (decodedText) => {
              handleScanSuccess(decodedText);
              stopScanner();
            },
            (errorMessage) => {
              // Not Found errors are normal during scanning, but we can log them if needed for debug
            }
          );
        } catch (innerErr) {
          console.error("Error starting camera stream:", innerErr);
          toast({ 
            title: 'Error de Cámara', 
            description: 'No se pudo iniciar la transmisión de video. Reintenta.', 
            variant: 'destructive' 
          });
          setShowScanner(false);
        }
      }, 300);

    } catch (err) {
      console.error("Error detecting cameras:", err);
      setHasCameraPermission(false);
      toast({ 
        title: 'Acceso Denegado', 
        description: 'Por favor permite el acceso a la cámara en tu navegador.', 
        variant: 'destructive' 
      });
    }
  };

  const stopScanner = async () => {
    setShowScanner(false);
    if (scannerInstance.current && scannerInstance.current.isScanning) {
      try {
        await scannerInstance.current.stop();
        // Optionlly clear the instance
        scannerInstance.current = null;
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'soporte321' || password === 'superadmin321') {
      setIsAuthenticated(true);
      toast({ title: 'Acceso concedido', description: 'Listo para el control de acceso y membresías ASV.' });
    } else {
      toast({ title: 'Error', description: 'Clave incorrecta.', variant: 'destructive' });
    }
  };

  const handleScanSuccess = (decodedId: string) => {
    const participant = findParticipantById(decodedId);
    if (!participant) {
      toast({ title: 'Error', description: 'Código QR no reconocido.', variant: 'destructive' });
      return;
    }

    if (participant.status === 'validated' && participant.membershipStatus === 'active') {
       const isNewCheckin = markAttendance(decodedId);
       const updatedParticipant = findParticipantById(decodedId);
       
       if (updatedParticipant) {
         setLastScanned(updatedParticipant);
         if (isNewCheckin) {
           toast({ title: 'Acceso Autorizado', description: `${updatedParticipant.fullName} ha ingresado.` });
         } else {
           toast({ title: 'Aviso', description: 'El participante ya había registrado su ingreso.', variant: 'secondary' });
         }
       }
       refreshData();
    } else {
       setLastScanned(participant);
       toast({ 
         title: 'Acceso Restringido', 
         description: 'Verifique Pago y Membresía ASV.', 
         variant: 'destructive' 
       });
    }
  };

  const handleToggleMembership = (id: string, current: string) => {
    const newStatus = current === 'active' ? 'inactive' : 'active';
    updateMembershipStatus(id, newStatus);
    toast({ 
      title: 'Membresía ASV Actualizada', 
      description: `Estatus: ${newStatus === 'active' ? 'Activa' : 'Pendiente'}` 
    });
    refreshData();
    if (lastScanned && lastScanned.id === id) {
      const updated = findParticipantById(id);
      if (updated) setLastScanned(updated);
    }
  };

  const downloadAttendanceReport = () => {
    const present = participants.filter(p => p.attendance === 'present');
    const headers = ['Nombre', 'Cedula', 'Grupo', 'Tipo', 'Estatus Asistencia'];
    const rows = present.map(p => [p.fullName, p.dni, p.scoutGroup, p.userType, 'PRESENTE']);
    
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.map(field => `"${field}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "asistencia_cocoro.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadFullRegistry = () => {
    const headers = ['Nombre', 'Cedula', 'Email', 'Grupo', 'Tipo', 'Pago', 'Membresía ASV', 'Asistencia'];
    const rows = participants.map(p => [
      p.fullName, 
      p.dni, 
      p.email, 
      p.scoutGroup, 
      p.userType, 
      statusTranslations[p.status] || p.status, 
      p.membershipStatus === 'active' ? 'Activa' : 'Pendiente', 
      p.attendance === 'present' ? 'PRESENTE' : 'AUSENTE'
    ]);
    
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.map(field => `"${field}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "registro_completo_cocoro.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredParticipants = participants.filter(p => {
    if (filter === 'present') return p.attendance === 'present';
    if (filter === 'absent') return p.attendance === 'absent';
    return true;
  });

  const stats = {
    total: participants.length,
    present: participants.filter(p => p.attendance === 'present').length,
    absent: participants.filter(p => p.attendance === 'absent').length
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col">
        <AppNavbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 shadow-xl border-t-4 border-t-primary">
            <div className="text-center space-y-4">
              <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center text-primary">
                <Lock className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-primary">Operaciones Distrito Ávila</h2>
              <p className="text-sm text-muted-foreground">Control de Acceso y Membresía ASV.</p>
              <form onSubmit={handleLogin} className="space-y-4 mt-6">
                <Input 
                  type="password" 
                  placeholder="Clave de operaciones" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-center"
                />
                <Button type="submit" className="w-full bg-primary font-bold">Iniciar Operaciones</Button>
              </form>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppNavbar />
      <main className="flex-1 container mx-auto py-10 px-4 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Operaciones Distrito Ávila</h1>
            <p className="text-muted-foreground">Gestión de Acceso y Membresías ASV</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={downloadAttendanceReport} variant="outline" className="border-primary text-primary hover:bg-primary/5">
              <Download className="mr-2 h-4 w-4" /> Asistencia
            </Button>
            <Button onClick={downloadFullRegistry} variant="outline" className="border-primary text-primary hover:bg-primary/5">
              <ClipboardList className="mr-2 h-4 w-4" /> Registro Total
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Registrados</p>
                <h3 className="text-2xl font-bold">{stats.total}</h3>
              </div>
              <Users className="h-8 w-8 text-blue-500/20" />
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Presentes</p>
                <h3 className="text-2xl font-bold text-green-600">{stats.present}</h3>
              </div>
              <UserCheck className="h-8 w-8 text-green-500/20" />
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ausentes</p>
                <h3 className="text-2xl font-bold text-amber-600">{stats.absent}</h3>
              </div>
              <UserMinus className="h-8 w-8 text-amber-500/20" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="scanner" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="scanner">Escáner / Check-in</TabsTrigger>
            <TabsTrigger value="list">Listado / Control</TabsTrigger>
          </TabsList>

          <TabsContent value="scanner" className="space-y-8">
            <div className="max-w-lg mx-auto space-y-8">
              <Card className="overflow-hidden shadow-2xl border-none">
                <CardContent className="p-0">
                  <div className={`aspect-square relative flex flex-col items-center justify-center bg-muted`}>
                    <div id={scannerId} className="w-full h-full"></div>
                    {!showScanner && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-muted z-10">
                         <QrCode className="h-24 w-24 text-primary/20 mx-auto" />
                         <p className="text-sm font-medium text-muted-foreground">Escáner en espera</p>
                      </div>
                    )}
                  </div>
                  <div className="p-6 bg-white border-t">
                    {hasCameraPermission === false && (
                       <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Permiso Requerido</AlertTitle>
                          <AlertDescription>
                            Para usar el escáner, debes permitir el acceso a la cámara en la configuración del navegador.
                          </AlertDescription>
                       </Alert>
                    )}
                    <Button 
                      onClick={() => showScanner ? stopScanner() : startScanner()} 
                      className={`w-full h-16 text-xl font-bold shadow-lg transition-all ${showScanner ? 'bg-red-500 hover:bg-red-600' : 'bg-primary'}`}
                    >
                      {showScanner ? <X className="mr-2" /> : <Camera className="mr-2" />}
                      {showScanner ? 'Cerrar Cámara' : 'Abrir Escáner'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {lastScanned && (
                <Card className={`animate-in slide-in-from-bottom-4 border-2 ${lastScanned.status === 'validated' && lastScanned.membershipStatus === 'active' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                           <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                           <p className="font-bold text-xl text-primary leading-tight">{lastScanned.fullName}</p>
                           <p className="text-sm text-muted-foreground">{lastScanned.dni} • {lastScanned.scoutGroup}</p>
                        </div>
                      </div>
                      <Badge variant={lastScanned.attendance === 'present' ? 'default' : 'outline'} className={lastScanned.attendance === 'present' ? 'bg-green-600' : ''}>
                        {lastScanned.attendance === 'present' ? 'PRESENTE' : 'AUSENTE'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Estatus Pago</span>
                        <Badge variant={lastScanned.status === 'validated' ? 'default' : 'destructive'} className={lastScanned.status === 'validated' ? 'bg-green-600' : ''}>
                          {statusTranslations[lastScanned.status] || lastScanned.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Membresía ASV</span>
                        <Badge variant={lastScanned.membershipStatus === 'active' ? 'default' : 'secondary'} className={lastScanned.membershipStatus === 'active' ? 'bg-blue-600' : ''}>
                          {lastScanned.membershipStatus === 'active' ? 'ACTIVA' : 'PENDIENTE'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleToggleMembership(lastScanned.id, lastScanned.membershipStatus)}
                        className={`flex-1 ${lastScanned.membershipStatus === 'active' ? 'bg-amber-600' : 'bg-blue-600'}`}
                      >
                        <Award className="mr-2 h-4 w-4" /> 
                        {lastScanned.membershipStatus === 'active' ? 'Poner Pendiente' : 'Validar ASV'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                <span className="font-bold text-sm uppercase">Filtro de Asistencia:</span>
              </div>
              <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Filtrar por..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos ({stats.total})</SelectItem>
                  <SelectItem value="present">Presentes ({stats.present})</SelectItem>
                  <SelectItem value="absent">Ausentes ({stats.absent})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="shadow-md overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Grupo</TableHead>
                      <TableHead>Asistencia</TableHead>
                      <TableHead>Membresía ASV</TableHead>
                      <TableHead className="text-right">Acción ASV</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParticipants.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                          {filter === 'all' ? 'No hay participantes registrados.' : 'No se encontraron participantes con este criterio.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredParticipants.map((p) => (
                        <TableRow key={p.id} className={p.attendance === 'present' ? 'bg-green-50/50' : ''}>
                          <TableCell>
                            <div className="font-medium">{p.fullName}</div>
                            <div className="text-[10px] text-muted-foreground uppercase">{p.dni}</div>
                          </TableCell>
                          <TableCell className="text-xs">{p.scoutGroup}</TableCell>
                          <TableCell>
                            <Badge variant={p.attendance === 'present' ? 'default' : 'outline'} className={p.attendance === 'present' ? 'bg-green-600' : 'text-amber-600 border-amber-200'}>
                              {p.attendance === 'present' ? 'PRESENTE' : 'AUSENTE'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={p.membershipStatus === 'active' ? 'default' : 'secondary'} className={p.membershipStatus === 'active' ? 'bg-blue-600' : ''}>
                              {p.membershipStatus === 'active' ? 'Activa' : 'Pendiente'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleToggleMembership(p.id, p.membershipStatus)}
                              className={p.membershipStatus === 'active' ? "text-amber-600" : "text-blue-600"}
                            >
                              {p.membershipStatus === 'active' ? <Clock className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                              <span className="ml-1">{p.membershipStatus === 'active' ? 'Poner Pendiente' : 'Activar ASV'}</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
