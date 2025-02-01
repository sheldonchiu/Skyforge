import { useRef, RefObject } from 'react';

interface FormRefs {
  [key: string]: RefObject<HTMLInputElement>;
}

interface FormUtils {
  formRef: RefObject<HTMLFormElement>;
  refs: FormRefs;
  getFormData: () => { [key: string]: FormDataEntryValue } | null;
  resetForm: () => void;
}

export const useFormRefs = (fields: string[]): FormUtils => {
  const formRef = useRef<HTMLFormElement>(null);
  
  const refs: FormRefs = fields.reduce((acc, field) => {
    acc[field] = useRef<HTMLInputElement>(null);
    return acc;
  }, {} as FormRefs);

  const getFormData = (): { [key: string]: FormDataEntryValue } | null => {
    if (!formRef.current) return null;
    
    const formData = new FormData(formRef.current);
    return Object.fromEntries(formData);
  };

  const resetForm = (): void => {
    formRef.current?.reset();
  };

  return {
    formRef,
    refs,
    getFormData,
    resetForm
  };
};
