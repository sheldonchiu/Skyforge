/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

// Form field configuration in JSON
const formConfig = {
    sections: [
        {
            id: 'personal',
            title: 'Personal Information',
            fields: [
                {
                    id: 'firstName',
                    type: 'text',
                    label: 'First Name',
                    required: true,
                },
                {
                    id: 'lastName',
                    type: 'text',
                    label: 'Last Name',
                    required: true,
                },
                {
                    id: 'email',
                    type: 'email',
                    label: 'Email Address',
                    required: true,
                }
            ]
        },
        {
            id: 'preferences',
            title: 'Preferences',
            fields: [
                {
                    id: 'notification',
                    type: 'select',
                    label: 'Notification Preference',
                    options: [
                        { value: 'email', label: 'Email' },
                        { value: 'sms', label: 'SMS' },
                        { value: 'push', label: 'Push Notification' }
                    ]
                },
                {
                    id: 'subscribe',
                    type: 'checkbox',
                    label: 'Subscribe to newsletter'
                }
            ]
        }
    ]
};

export const DynamicForm = () => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // const validateField = (field, value) => {
    //     if (field.required && !value) {
    //         return `${field.label} is required`;
    //     }

    //     if (field.validation) {
    //         if (field.validation.minLength && value.length < field.validation.minLength) {
    //             return `${field.label} must be at least ${field.validation.minLength} characters`;
    //         }
    //         if (field.validation.maxLength && value.length > field.validation.maxLength) {
    //             return `${field.label} must be less than ${field.validation.maxLength} characters`;
    //         }
    //         if (field.validation.pattern && !field.validation.pattern.test(value)) {
    //             return `Please enter a valid ${field.label.toLowerCase()}`;
    //         }
    //     }

    //     return '';
    // };

    const handleChange = (fieldId, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldId]: value
        }));

        // Find the field configuration
        const field = formConfig.sections
            .flatMap(section => section.fields)
            .find(f => f.id === fieldId);

        // Validate the field
        // const error = validateField(field, value);
        // setErrors(prev => ({
        //     ...prev,
        //     [fieldId]: error
        // }));
    };

    const handleBlur = (fieldId) => {
        setTouched(prev => ({
            ...prev,
            [fieldId]: true
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validate all fields
        // const newErrors = {};
        // formConfig.sections.forEach(section => {
        //     section.fields.forEach(field => {
        //         const error = validateField(field, formData[field.id]);
        //         if (error) {
        //             newErrors[field.id] = error;
        //         }
        //     });
        // });

        // setErrors(newErrors);

        // if (Object.keys(newErrors).length === 0) {
        //     // Simulate API call
        //     try {
        //         await new Promise(resolve => setTimeout(resolve, 1000));
        //         console.log('Form submitted:', formData);
        //         // Reset form
        //         setFormData({});
        //         setTouched({});
        //     } catch (error) {
        //         console.error('Submission failed:', error);
        //     }
        // }

        setIsSubmitting(false);
    };

    const renderField = (field) => {
        const commonProps = {
            id: field.id,
            name: field.id,
            value: formData[field.id] || '',
            onChange: (e) => handleChange(field.id, field.type === 'checkbox' ? e.target.checked : e.target.value),
            onBlur: () => handleBlur(field.id),
            disabled: isSubmitting
        };

        switch (field.type) {
            case 'select':
                return (
                    <select className="select" {...commonProps}>
                        <option value="">Select {field.label}</option>
                        {field.options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'checkbox':
                return (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            {...commonProps}
                            checked={formData[field.id] || false}
                            className="checkbox"
                        />
                        <span className="ml-2 text-sm text-base-content">{field.label}</span>
                    </div>
                );

            default:
                return (
                    <input
                        type={field.type}
                        className='input'
                        {...commonProps}
                    />
                );
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4"
        >

            {/* Form Sections */}
            <div className="p-8 space-y-8">
                {formConfig.sections.map(section => (
                    <div key={section.id} className="collapse bg-base-100 border border-base-300">
                        <input type="checkbox" />
                        <div className="collapse-title font-semibold">{section.title}</div>
                        <div className="collapse-content text-sm">
                        <fieldset className="fieldset w-auto bg-base-200 p-4 rounded-box">
                            <div key={section.id} className="space-y-6">
                                {section.fields.map(field => (
                                    <div key={field.id} className="space-y-1">
                                    <label className="fieldset-label">
                                        {field.type !== 'checkbox' && (
                                        <span>
                                            {field.label}
                                            {field.required && <span className="text-error ml-1">*</span>}
                                        </span>
                                        )}
                                        </label>
                                        {renderField(field)}
                                        {errors[field.id] && touched[field.id] && (
                                            <p className="text-sm text-error mt-1">{errors[field.id]}</p>
                                        )}
                                    </div>
                                ))}
                                </div>
                        </fieldset>
                        </div>
                    </div>
                ))}
            </div>

            {/* Form Footer */}
            <div className="px-8 py-6 bg-gray-50 border-t">
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => {
                            setFormData({});
                            setErrors({});
                            setTouched({});
                        }}
                        className="px-6 py-2 rounded-field text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                        disabled={isSubmitting}
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        className={`px-6 py-2 rounded-field text-white transition-all duration-200 ${isSubmitting
                                ? 'bg-indigo-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default DynamicForm;
