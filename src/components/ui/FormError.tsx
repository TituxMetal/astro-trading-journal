type FormErrorProps = {
  message?: string
}

const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null

  return <div className='rounded-md bg-red-800/80 p-3 font-bold text-red-300'>{message}</div>
}

export default FormError
