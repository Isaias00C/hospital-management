import { ENUMS } from '../constants/fields';
import { fieldErrorProps } from '../constants/validation';

export default function FieldSelect({ field, value, onChange, errors, options = ENUMS[field] }) {
  const error = errors[field];
  return (
    <>
      <select
        id={field}
        name={field}
        value={value ?? ''}
        onChange={(event) => onChange(field, event.target.value)}
        className={'input-field' + (error ? ' input-field-error' : '')}
        {...fieldErrorProps(errors, field)}
      >
        <option value="" disabled>Selecione uma opção</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {error && <p id={field + '-error'} className="mt-1 text-xs text-rose-700">{error}</p>}
    </>
  );
}
