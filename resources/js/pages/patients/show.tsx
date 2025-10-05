import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { hasPermission } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { patients as patientsRoute } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Mail, MapPin, Phone, User } from 'lucide-react';

type Patient = {
    id: number;
    user: { id: number; name: string; email: string; created_at: string };
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    birthday: string;
    address: string;
    phone?: string | null;
    created_at: string;
    updated_at: string;
};

interface PatientShowPageProps extends SharedData {
    patient: Patient;
}

export default function PatientShow() {
    const { patient } = usePage<PatientShowPageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Patients', href: patientsRoute().url },
        { title: `${patient.first_name} ${patient.last_name}`, href: `/patients/${patient.id}` },
    ];

    // Permission checks
    const canView = hasPermission('patients.view');
    const canEdit = hasPermission('patients.edit');

    // If user doesn't have view permission, show access denied
    if (!canView) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Access Denied" />
                <div className="flex h-full flex-1 flex-col items-center justify-center p-4">
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold text-destructive">Access Denied</h1>
                        <p className="mt-2 text-muted-foreground">You don't have permission to view patient details.</p>
                        <Button variant="outline" className="mt-4" asChild>
                            <Link href={patientsRoute().url}>Back to Patients</Link>
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Helper function to format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Helper function to calculate age
    const calculateAge = (birthday: string) => {
        const today = new Date();
        const birthDate = new Date(birthday);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${patient.first_name} ${patient.last_name} - Patient Details`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={patientsRoute().url} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Patients
                        </Link>
                    </div>
                    {canEdit && (
                        <Button variant="outline" asChild>
                            <Link href={`/patients/${patient.id}/edit`}>Edit Patient</Link>
                        </Button>
                    )}
                </div>

                {/* Main Content */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Patient Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Patient Information
                            </CardTitle>
                            <CardDescription>Personal details and contact information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                <p className="mt-1 text-lg font-semibold">
                                    {patient.first_name} {patient.middle_name ? patient.middle_name + ' ' : ''}
                                    {patient.last_name}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Birthday</label>
                                    <p className="text-sm">
                                        {formatDate(patient.birthday)}
                                        <span className="ml-2 text-muted-foreground">({calculateAge(patient.birthday)} years old)</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                                    <p className="text-sm">{patient.address}</p>
                                </div>
                            </div>

                            {patient.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                        <p className="text-sm">{patient.phone}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Account Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Account Information
                            </CardTitle>
                            <CardDescription>User account and system details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Account Name</label>
                                <p className="mt-1 text-sm">{patient.user.name}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                    <p className="text-sm">{patient.user.email}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                                <p className="text-sm">{formatDate(patient.user.created_at)}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Patient Record Created</label>
                                <p className="text-sm">{formatDate(patient.created_at)}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                                <p className="text-sm">{formatDate(patient.updated_at)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Future sections can be added here */}
                <div className="grid gap-6 md:grid-cols-1">
                    {/* Medical History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Medical Records</CardTitle>
                            <CardDescription>Patient's medical history and appointments (Coming Soon)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Medical records and appointment history will be displayed here.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
