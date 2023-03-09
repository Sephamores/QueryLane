import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import RTE from './RTE';

export default function RichTextDialog({ onChange, onSubmit, onCancel, ...props }) {
  return (
    <div>
      <Dialog {...props}>
        <DialogTitle >Type below</DialogTitle>
        <DialogContent>
          <RTE
            onChange={onChange}
            {...props}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={onSubmit}>Done</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}