"use client"
import { useState, useEffect } from 'react';
import { AppNavbar } from '@/components/AppNavbar';
import { getParticipants, updateParticipantStatus, deleteParticipant, clearAllData, saveParticipant } from '@/lib/store';
import { Participant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';
import { ShieldCheck, Eye, CheckCircle, XCircle, Download, Lock, Trash2, RotateCcw, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const statusTranslations: Record<string, string> = {
  pending: 'Pendiente',
  validated: 'Validado',
  rejected: 'Rechazado'
};

const SCOUT_GROUPS = [
  "ARISTIDES ROJAS",
  "BICENTENARIO",
  "DON BOSCO 21",
  "HENRI PITTIER",
  "LA SALLE LA COLINA",
  "NEPTUNO"
];

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);

  const refreshData = () => {
    const data = getParticipants();
    setParticipants([...data]);
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin321') {
      setIsAuthenticated(true);
      setIsSuperAdmin(false);
      toast({ title: 'Acceso concedido', description: 'Panel Administrativo - Finanzas.' });
    } else if (password === 'superadmin321') {
      setIsAuthenticated(true);
      setIsSuperAdmin(true);
      toast({ title: 'Acceso Super Admin', description: 'Control total habilitado.' });
    } else {
      toast({ title: 'Error', description: 'Clave incorrecta.', variant: 'destructive' });
    }
  };

  const handleValidate = (id: string) => {
    updateParticipantStatus(id, 'validated', `QR_${id}`);
    toast({ title: 'Pago Validado', description: 'El pago ha sido registrado correctamente.' });
    refreshData();
    setSelectedParticipant(null);
  };

  const handleReject = (id: string) => {
    updateParticipantStatus(id, 'rejected');
    toast({ title: 'Registro Rechazado', description: 'Se ha actualizado el estatus del pago.' });
    refreshData();
    setSelectedParticipant(null);
  };

  const handleDelete = (id: string) => {
    const updated = deleteParticipant(id);
    setParticipants([...updated]);
    setEditingParticipant(null);
    setSelectedParticipant(null);
    toast({ title: 'Registro Eliminado', description: 'Los datos han sido borrados permanentemente.' });
  };

  const handleResetData = () => {
    const updated = clearAllData();
    setParticipants([...updated]);
    toast({ title: 'Sistema Reiniciado', description: 'La base de datos está vacía.' });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingParticipant) {
      const updated = saveParticipant(editingParticipant);
      setParticipants([...updated]);
      setEditingParticipant(null);
      toast({ title: 'Datos Actualizados', description: 'Los cambios se han guardado correctamente.' });
    }
  };

  const downloadValidatedPayments = () => {
    const validated = participants.filter(p => p.status === 'validated');
    if (validated.length === 0) {
      toast({ title: 'Aviso', description: 'No hay pagos validados para descargar.' });
      return;
    }
    const headers = ['Nombre', 'Cedula', 'Email', 'Tipo', 'Grupo', 'Referencia', 'Monto (Bs)', 'Fecha', 'Membresía ASV'];
    const rows = validated.map(p => [
      p.fullName, p.dni, p.email, p.userType, p.scoutGroup, p.bankReference, p.amount.toLocaleString('es-VE'), p.paymentDate, p.membershipStatus === 'active' ? 'Activa' : 'Pendiente'
    ]);
    
    // Add BOM for Excel UTF-8 compatibility
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.map(field => `"${field}"`).join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "pagos_validados_cocoro.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <h2 className="text-2xl font-bold text-primary">Administración COCORO</h2>
              <p className="text-sm text-muted-foreground">Validación de pagos y finanzas.</p>
              <form onSubmit={handleLogin} className="space-y-4 mt-6">
                <input type="hidden" name="form-name" value="admin-login" />
                <Input 
                  type="password" 
                  placeholder="Clave de administración" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-center"
                  autoComplete="current-password"
                />
                <Button type="submit" className="w-full bg-primary font-bold">Entrar al Panel</Button>
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
      <main className="flex-1 container mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center">
              <ShieldCheck className="mr-2 h-8 w-8" /> Finanzas y Pagos COCORO
            </h1>
            <p className="text-muted-foreground">Gestión de Pagos - Distrito Ávila.</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
             <Button onClick={downloadValidatedPayments} variant="outline" className="border-primary text-primary hover:bg-primary/5">
                <Download className="mr-2 h-4 w-4" /> Pagos Validados
             </Button>
             {isSuperAdmin && (
               <Button onClick={handleResetData} variant="destructive" className="bg-red-600">
                  <RotateCcw className="mr-2 h-4 w-4" /> Reiniciar Datos
               </Button>
             )}
          </div>
        </div>

        <Card className="shadow-md overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cédula</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Membresía ASV</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      No hay registros todavía en COCORO.
                    </TableCell>
                  </TableRow>
                ) : (
                  participants.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.fullName}</TableCell>
                      <TableCell>{p.dni}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === 'validated' ? 'default' : p.status === 'pending' ? 'secondary' : 'destructive'} className={p.status === 'validated' ? 'bg-green-600' : ''}>
                          {statusTranslations[p.status] || p.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={p.membershipStatus === 'active' ? 'default' : 'outline'} className={p.membershipStatus === 'active' ? 'bg-blue-600' : ''}>
                          {p.membershipStatus === 'active' ? 'Activa' : 'Pendiente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedParticipant(p)} className="text-primary hover:bg-primary/5">
                          <Eye className="h-4 w-4 mr-1" /> Revisar
                        </Button>
                        {isSuperAdmin && (
                          <Button variant="ghost" size="sm" onClick={() => setEditingParticipant(p)} className="text-blue-600 hover:bg-blue-50">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={!!selectedParticipant} onOpenChange={() => setSelectedParticipant(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-primary text-2xl font-bold">Revisión de Pago</DialogTitle>
              <DialogDescription>Valida la transacción bancaria del participante.</DialogDescription>
            </DialogHeader>
            
            {selectedParticipant && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg space-y-3 text-sm border">
                    <h4 className="font-bold border-b pb-2 mb-2 text-primary uppercase text-xs tracking-wider">DATOS BANCARIOS</h4>
                    <p><strong>Referencia:</strong> {selectedParticipant.bankReference}</p>
                    <p><strong>Monto:</strong> Bs. {selectedParticipant.amount.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</p>
                    <p><strong>Fecha:</strong> {selectedParticipant.paymentDate}</p>
                    <p><strong>Nombre:</strong> {selectedParticipant.fullName}</p>
                    <p><strong>Cédula:</strong> {selectedParticipant.dni}</p>
                    <p><strong>Membresía ASV:</strong> <Badge variant="outline">{selectedParticipant.membershipStatus === 'active' ? 'Activa' : 'Pendiente'}</Badge></p>
                    <p><strong>Estatus Pago:</strong> {statusTranslations[selectedParticipant.status]}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-sm uppercase text-muted-foreground">Comprobante</h4>
                  <div className="border rounded-lg overflow-hidden bg-muted flex items-center justify-center min-h-[300px]">
                    <img src={selectedParticipant.receiptUrl} alt="Comprobante" className="max-w-full h-auto shadow-sm" />
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="mt-8 flex flex-col sm:flex-row gap-2 border-t pt-6">
              <Button variant="outline" onClick={() => handleReject(selectedParticipant?.id!)} className="border-destructive text-destructive hover:bg-destructive hover:text-white flex-1">
                <XCircle className="mr-2 h-4 w-4" /> Rechazar Pago
              </Button>
              <Button onClick={() => handleValidate(selectedParticipant?.id!)} className="bg-green-600 hover:bg-green-700 text-white flex-1">
                <CheckCircle className="mr-2 h-4 w-4" /> Validar Pago
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog - Super Admin Only */}
        <Dialog open={!!editingParticipant} onOpenChange={() => setEditingParticipant(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-primary text-2xl font-bold">Editar Registro</DialogTitle>
              <DialogDescription>Modifica los datos cargados por el usuario o elimina el registro.</DialogDescription>
            </DialogHeader>
            
            {editingParticipant && (
              <div className="space-y-6 py-4">
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre y Apellido</Label>
                      <Input 
                        value={editingParticipant.fullName} 
                        onChange={(e) => setEditingParticipant({...editingParticipant, fullName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cédula / ID</Label>
                      <Input 
                        value={editingParticipant.dni} 
                        onChange={(e) => setEditingParticipant({...editingParticipant, dni: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Correo Electrónico</Label>
                      <Input 
                        value={editingParticipant.email} 
                        onChange={(e) => setEditingParticipant({...editingParticipant, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Grupo Scout</Label>
                      <Select 
                        value={editingParticipant.scoutGroup} 
                        onValueChange={(v) => setEditingParticipant({...editingParticipant, scoutGroup: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SCOUT_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Referencia Bancaria</Label>
                      <Input 
                        value={editingParticipant.bankReference} 
                        onChange={(e) => setEditingParticipant({...editingParticipant, bankReference: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Monto (Bs)</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        value={editingParticipant.amount} 
                        onChange={(e) => setEditingParticipant({...editingParticipant, amount: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                    <Button type="button" variant="outline" onClick={() => setEditingParticipant(null)}>Cancelar</Button>
                    <Button type="submit" className="bg-primary">Guardar Cambios</Button>
                  </div>
                </form>

                <div className="border-t pt-6">
                  <h4 className="text-sm font-bold text-red-600 mb-2 uppercase tracking-wider">Zona de Peligro</h4>
                  <p className="text-xs text-muted-foreground mb-4">Borrado inmediato del registro. Esta acción no se puede deshacer.</p>
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={() => handleDelete(editingParticipant.id)}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar Registro Definitivamente
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
