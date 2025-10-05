import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { hasPermission } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { patients as patientsRoute } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, ExternalLink, FileText, Mail, MapPin, Phone, Upload, User, X } from 'lucide-react';
import { useState } from 'react';

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

type ServiceOffering = {
    id: number;
    name: string;
    type: string;
    description?: string;
    price: number;
    is_available: boolean;
};

type ServiceResult = {
    id: number;
    patient_id: number;
    service_name: string;
    service_type: string;
    written_result?: string;
    file_path?: string[];
    created_at: string;
    updated_at: string;
    uploaded_by?: {
        id: number;
        name: string;
        email: string;
    };
};

interface PatientShowPageProps extends SharedData {
    patient: Patient;
    serviceOfferings: ServiceOffering[];
    serviceResults: ServiceResult[];
}

export default function PatientShow() {
    const { patient, auth, serviceOfferings: propsServiceOfferings, serviceResults } = usePage<PatientShowPageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Patients', href: patientsRoute().url },
        { title: `${patient.first_name} ${patient.last_name}`, href: `/patients/${patient.id}` },
    ];

    // Permission checks
    const canView = hasPermission('patients.view');
    const canEdit = hasPermission('patients.edit');
    const canUploadResults = hasPermission('results.upload');

    // Dialog and form state
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const uploadForm = useForm({
        patient_id: patient.id,
        service_offering_id: '',
        notes: '',
        files: [] as File[],
    });

    // Use service offerings from props (no need to fetch separately)
    const serviceOfferings = propsServiceOfferings || [];

    // Handle file selection with validation
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);

        // Validate file types (images and PDFs only)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'application/pdf'];
        const validFiles = selectedFiles.filter((file) => allowedTypes.includes(file.type));
        const invalidFiles = selectedFiles.filter((file) => !allowedTypes.includes(file.type));

        if (invalidFiles.length > 0) {
            alert(`Invalid file types: ${invalidFiles.join(', ')}. Only images and PDF files are allowed.`);
        }

        uploadForm.setData('files', [...uploadForm.data.files, ...validFiles]);
    };

    // Remove selected file
    const removeFile = (index: number) => {
        uploadForm.setData(
            'files',
            uploadForm.data.files.filter((_, i) => i !== index),
        );
    }; // Handle form submission
    const handleSubmitResult = (event: React.FormEvent) => {
        event.preventDefault();

        if (!uploadForm.data.service_offering_id) {
            alert('Please select a service offering');
            return;
        }

        uploadForm.post('/service-results', {
            onSuccess: () => {
                setUploadDialogOpen(false);
                uploadForm.reset();
            },
            onError: (errors) => {
                console.error('Upload failed:', errors);
            },
        });
    };

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

                {/* Service Results Section */}
                <div className="grid gap-6 md:grid-cols-1">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div>
                                <CardTitle>Medical Records</CardTitle>
                                <CardDescription>
                                    {serviceResults.length > 0
                                        ? `${serviceResults.length} medical result${serviceResults.length === 1 ? '' : 's'} on file`
                                        : 'No medical results on file'}
                                </CardDescription>
                            </div>
                            {canUploadResults && (
                                <Button variant="outline" size="sm" onClick={() => setUploadDialogOpen(true)}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Result
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {serviceResults.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Service</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Notes</TableHead>
                                            <TableHead>Files</TableHead>
                                            <TableHead>Uploaded By</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {serviceResults.map((result) => (
                                            <TableRow key={result.id}>
                                                <TableCell className="font-medium">{result.service_name}</TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                                        {result.service_type}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="max-w-xs">
                                                    {result.written_result ? (
                                                        <div className="truncate" title={result.written_result}>
                                                            {result.written_result}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground italic">No notes</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {result.file_path && result.file_path.length > 0 ? (
                                                        <div className="flex flex-col gap-1">
                                                            {result.file_path.map((filePath, index) => {
                                                                const fileName = filePath.split('/').pop() || 'Unknown file';
                                                                const fileExtension = fileName.split('.').pop()?.toLowerCase();
                                                                const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension || '');
                                                                // Use backend route for secure file access
                                                                const fileUrl = `/service-results/file/${result.id}/${index}`;

                                                                return (
                                                                    <div key={index} className="flex items-center gap-1">
                                                                        <FileText className="h-3 w-3" />
                                                                        <a
                                                                            href={fileUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                                                            title={`View ${fileName}`}
                                                                        >
                                                                            {fileName.length > 15 ? `${fileName.substring(0, 15)}...` : fileName}
                                                                            <ExternalLink className="h-2 w-2" />
                                                                        </a>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground italic">No files</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm">{result.uploaded_by?.name || 'Unknown'}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{formatDate(result.created_at)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="py-8 text-center">
                                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No medical results</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {canUploadResults
                                            ? 'Upload the first medical result for this patient.'
                                            : 'No medical results have been uploaded yet.'}
                                    </p>
                                    {canUploadResults && (
                                        <Button variant="outline" size="sm" className="mt-4" onClick={() => setUploadDialogOpen(true)}>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload First Result
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Upload Result Dialog */}
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Upload Medical Result</DialogTitle>
                            <DialogDescription>
                                Upload medical test results or documents for {patient.first_name} {patient.last_name}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmitResult}>
                            <div className="space-y-4 py-4">
                                {/* Service Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="service_offering">Service/Test Type *</Label>
                                    <Select
                                        value={uploadForm.data.service_offering_id}
                                        onValueChange={(value) => uploadForm.setData('service_offering_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={serviceOfferings.length === 0 ? 'No services available' : 'Select a service'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {serviceOfferings.map((service) => (
                                                <SelectItem key={service.id} value={service.id.toString()}>
                                                    {service.name}
                                                    {service.description && (
                                                        <span className="ml-2 text-xs text-muted-foreground">- {service.description}</span>
                                                    )}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Additional Notes */}
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Additional Medical/Doctor Notes</Label>
                                    <textarea
                                        id="notes"
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Enter any additional notes or observations..."
                                        value={uploadForm.data.notes}
                                        onChange={(e) => uploadForm.setData('notes', e.target.value)}
                                    />
                                </div>

                                {/* File Upload */}
                                <div className="space-y-2">
                                    <Label htmlFor="files">Files (Images & PDFs only)</Label>
                                    <Input
                                        id="files"
                                        type="file"
                                        multiple
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                        className="file:mr-4 file:rounded-md file:border-0 file:bg-muted file:px-4 file:py-2 file:text-sm file:font-medium"
                                    />
                                    <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG, GIF, PDF</p>

                                    {/* Selected Files List */}
                                    {uploadForm.data.files.length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            <Label className="text-sm font-medium">Selected Files:</Label>
                                            {uploadForm.data.files.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between rounded-md border p-2">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4" />
                                                        <span className="text-sm">{file.name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            ({(file.size / 1024 / 1024).toFixed(1)} MB)
                                                        </span>
                                                    </div>
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={!uploadForm.data.service_offering_id || uploadForm.processing}>
                                    {uploadForm.processing ? 'Uploading...' : 'Upload Result'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
