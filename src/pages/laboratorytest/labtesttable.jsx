// LabTestTable.jsx
import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, useTheme } from '@mui/material';
import { tokens } from '../../theme';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const LabTestTable = ({ rows, onEdit, onDelete }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // Define the columns inside the component so that it has access to onEdit and onDelete
  const columns = [
    { field: 'referenceNumber', headerName: 'Reference Number', flex: 1 },
    { field: 'testLocation', headerName: 'Test Location', flex: 1 },
    { field: 'testDate', headerName: 'Date Tested', flex: 1 },
    { field: 'testResult', headerName: 'Result', flex: 1 },
    {
      field: 'action',
      headerName: 'Action',
      sortable: false,
      flex: 1,
      renderCell: (params) => (
        <Box>
         {/* <Button
            startIcon={<EditIcon />}
            onClick={() => onEdit(params.id)}
            variant="contained"
            color="secondary"
            size="small"
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>*/}
          <Button
            startIcon={<DeleteIcon />}
            onClick={() => onDelete(params.id)}
            variant="contained"
            color="error"
            size="small"
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box
      sx={{
        height: 350, 
        width: "100%",
        "& .MuiDataGrid-root": {
          border: `1px solid ${colors.primary[700]}`,
          color: colors.grey[100],
          backgroundColor: colors.primary[400],
        },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: colors.blueAccent[700],
          color: colors.grey[100],
        },
        "& .MuiDataGrid-cell": {
          borderBottom: `1px solid ${colors.primary[700]}`,
        },
        "& .MuiDataGrid-footerContainer": {
          borderTop: `1px solid ${colors.primary[700]}`,
          backgroundColor: colors.blueAccent[700],
          color: colors.grey[100],
        },
        "& .MuiCheckbox-root": {
          color: colors.greenAccent[200],
        },
        "& .MuiDataGrid-toolbarContainer": {
          color: colors.grey[100],
        },
      }}
    >
      <DataGrid 
        rows={rows} 
        columns={columns} 
        pageSize={5}  
        rowsPerPageOptions={[5, 10, 20]}
      />
    </Box>
  );
};

export default LabTestTable;
