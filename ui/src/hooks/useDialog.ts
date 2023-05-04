import { useContext } from 'react';
import { DialogContext } from '../context';

const useDialog = () => useContext(DialogContext);

export default useDialog;
