import * as yup from 'yup';

export const registrationSchema = yup.object().shape({
    name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    role: yup.string().oneOf(['user', 'admin'], 'Invalid role').required('Role is required'),
    city: yup.string().required('City is required'),
    address: yup.string().required('Address is required'),
});

export const appointmentSchema = yup.object().shape({
    type: yup.string().oneOf(['hospital', 'police'], 'Invalid type').required('Type is required'),
    date: yup.date().required('Date is required').min(new Date(), 'Date must be in the future'),
});