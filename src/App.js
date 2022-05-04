import { Button, Container, Typography, Card, TextField, form, Grid, InputAdornment, Select, InputLabel, MenuItem, FormControl, Modal, TableContainer, Paper, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { Box } from '@mui/system';
import { useState, useContext, useEffect } from 'react';

export default function App() {

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: '#fff',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    color: '#000',
  };

  const [calculado, iscalculado] = useState(false);

  const [calculadoFinal, setCalculadoFinal] = useState(false);

  var [datos, setdatos] = useState({
    ip: '192.168.1.0',
    prefijo: '24',
    subredes_cantidad: 1,
    subredes: [
      {
        id: 1,
        nombre: 'S1',
        hosts_solicitados: 1,
        hosts_disponibles: 0,
        hosts_libres: 0,
        direcciones: {
          direccion_red: '',
          prefijo: '',
          mascara: '',
          broadcast: '',
          primera_ip: '',
          ultima_ip: '',
          wildcard: ''
        }
      }
    ]
  });

  var [ErrorDialogo, mostrarErrorDialogo] = useState(false);

  var [error, seterror] = useState({
    ip: {
      error: false,
      mensaje: 'La IP es correcta'
    },
    prefijo: {
      error: false,
      mensaje: 'El prefijo es correcto'
    },
    subredes: {
      error: false,
      mensaje: 'La cantidad de subredes es correcta'
    }
  });

  const handleChange = (event) => {
    if (event.target.name === 'subredes_cantidad') {
      var subredes = [];
      for (let index = 0; index < event.target.value; index++) {
        subredes.push({
          id: index + 1,
          nombre: 'S' + (index + 1),
          hosts_solicitados: 1,
          hosts_disponibles: 0,
          hosts_libres: 0,
          direcciones: {
            direccion_red: '',
            prefijo: '',
            mascara: '',
            broadcast: '',
            primera_ip: '',
            ultima_ip: '',
            wildcard: ''
          }
        });
      }
      setdatos({
        ...datos,
        subredes_cantidad: event.target.value,
        subredes: subredes
      });
    } else {
      setdatos({
        ...datos,
        [event.target.name]: event.target.value
      });
    }
  };

  const handleChangeSubredNombre = (event) => {
    var subredes = datos.subredes;
    subredes[event.target.id].nombre = event.target.value;
    setdatos({
      ...datos,
      subredes: subredes
    });
  };

  const handleChangeSubredHostsSolicitados = (event) => {
    var subredes = datos.subredes;
    subredes[event.target.id].hosts_solicitados = event.target.value;
    setdatos({
      ...datos,
      subredes: subredes
    });
  };

  function validarIP() {
    var ip = datos.ip.split('.');
    if (ip.length !== 4) {
      seterror({
        ...error,
        ip: [
          {
            error: true,
            mensaje: 'La IP debe tener 4 octetos'
          }
        ]
      });
      return false;
    }
    for (var i = 0; i < ip.length; i++) {
      if (ip[i] < 0 || ip[i] > 255 || isNaN(ip[i])) {
        seterror({
          ...error,
          ip: {
            error: true,
            mensaje: 'El octeto ' + (i + 1) + ' debe ser un número entre 0 y 255'
          }
        });
        return false;
      }
    }
    return true;
  }

  function validarPrefijo() {
    if (datos.prefijo < 1 || datos.prefijo > 32 || isNaN(datos.prefijo)) {
      seterror({
        ...error,
        prefijo: {
          error: true,
          mensaje: 'El prefijo debe estar entre 1 y 32'
        }
      });
      return false;
    }
    return true;
  }

  function validarSubredes() {
    if (datos.subredes_cantidad < 1 || datos.subredes_cantidad > 32 || isNaN(datos.subredes_cantidad)) {
      seterror({
        ...error,
        subredes:
        {
          error: true,
          mensaje: 'La cantidad de subredes debe estar entre 1 y 32'
        }
      });
      return false;
    }
    return true;
  }

  function validar() {
    if (!validarIP() || !validarPrefijo() || !validarSubredes()) {
      return false;
    } else {
      return true;
    }
  }

  const handleContinuar = () => {
    if (validar()) {
      iscalculado(true);
    } else {
      mostrarErrorDialogo(true);
    }
  };

  // Ordenar las subredes por la cantidad de hosts solicitados de mayor a menor

  function ordenarSubredes() {
    var subredes = datos.subredes;
    subredes.sort(function (a, b) {
      return b.hosts_solicitados - a.hosts_solicitados;
    });
    setdatos({
      ...datos,
      subredes: subredes
    });
  }

  function calcularSubneteo() {
    ordenarSubredes();
  }


  const handleCalcular = () => {
    if (validar()) {
      calcularSubneteo();
      setCalculadoFinal(true);
    } else {
      mostrarErrorDialogo(true);
    }
  };

  return (
    <>
      <Container alignItems="center" justifyContent="center" maxWidth="xl">
        <Typography variant="h1" gutterBottom align="center" color="white" style={{ marginTop: '20px', marginBottom: '20px', fontSize: '40px' }}>
          Calculadora VLSM
        </Typography>

        <Card style={{ padding: '20px' }} alignItems="center" justifyContent="center">
          <Typography variant="h2" gutterBottom align="center" color="primary" style={{ marginBottom: '20px', fontSize: '30px' }}>
            Introduzca los datos
          </Typography>


          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={6}>
              <TextField
                id="ip"
                name="ip"
                label="Dirección IP"
                variant="outlined"
                style={{ width: '100%' }}
                helperText='Ejemplo: 192.168.0.0'
                onChange={handleChange}
                value={datos.ip}

                inputProps={{
                  maxLength: 15
                }}
              />
            </Grid>

            <Grid item xs={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="mask">Prefijo de red</InputLabel>
                <Select
                  labelId="mask"
                  id="prefijo"
                  name="prefijo"
                  label="Prefijo de red"
                  variant="outlined"
                  style={{ width: '100%' }}
                  onChange={handleChange}
                  value={datos.prefijo}
                >
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={4}>4</MenuItem>
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={6}>6</MenuItem>
                  <MenuItem value={7}>7</MenuItem>
                  <MenuItem value={8}>8</MenuItem>
                  <MenuItem value={9}>9</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={11}>11</MenuItem>
                  <MenuItem value={12}>12</MenuItem>
                  <MenuItem value={13}>13</MenuItem>
                  <MenuItem value={14}>14</MenuItem>
                  <MenuItem value={15}>15</MenuItem>
                  <MenuItem value={16}>16</MenuItem>
                  <MenuItem value={17}>17</MenuItem>
                  <MenuItem value={18}>18</MenuItem>
                  <MenuItem value={19}>19</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={21}>21</MenuItem>
                  <MenuItem value={22}>22</MenuItem>
                  <MenuItem value={23}>23</MenuItem>
                  <MenuItem value={24}>24</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={26}>26</MenuItem>
                  <MenuItem value={27}>27</MenuItem>
                  <MenuItem value={28}>28</MenuItem>
                  <MenuItem value={29}>29</MenuItem>
                  <MenuItem value={30}>30</MenuItem>
                  <MenuItem value={31}>31</MenuItem>
                  <MenuItem value={32}>32</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={3}>
              <TextField
                id="subredes_cantidad"
                name="subredes_cantidad"
                label="Número de subredes"
                variant="outlined"
                width="100%"
                type="number"
                style={{ width: '100%' }}
                inputProps={{
                  min: 1,
                  max: 32,
                }}
                helperText='Ejemplo: 6'
                value={datos.subredes_cantidad}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Grid container justifyContent={'center'} alignItems={'center'}>
            <Button
              variant="contained"
              color="info"
              size="large"
              style={{ width: '20%', marginTop: '20px' }}
              onClick={handleContinuar}
            >Continuar </Button>
          </Grid>
        </Card>
        {
          calculado &&
          <>
            <Card style={{ padding: '20px', marginTop: '20px' }} alignItems="center" justifyContent="center">
              <Typography variant="h2" gutterBottom align="center" color="primary" style={{ marginBottom: '20px', fontSize: '30px' }}>
                Subredes
              </Typography>

              <Grid container spacing={3} style={{ marginBottom: '20px' }}>
                <Grid item xs={12}>
                  <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Subred</TableCell>
                          <TableCell align="right">Número de hosts</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {
                          datos.subredes.map((subred, index) => (
                            <TableRow key={index}>
                              <TableCell component="th" scope="row">
                                <TextField
                                  id={index}
                                  name={`subred_${index}`}
                                  label="Nombre de la subred"
                                  variant="outlined"
                                  style={{ width: '100%' }}
                                  value={subred.nombre}
                                  onChange={handleChangeSubredNombre}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <TextField
                                  id={index}
                                  name={`subred_${index}`}
                                  label="Número de hosts"
                                  variant="outlined"
                                  style={{ width: '100%' }}
                                  value={subred.hosts_solicitados}
                                  type="number"
                                  inputProps={{
                                    min: 1
                                  }}
                                  onChange={handleChangeSubredHostsSolicitados}
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        }
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Grid container justifyContent={'center'} alignItems={'center'}>
                    <Button
                      variant="contained"
                      color="success"
                      size="large"
                      style={{ width: '20%', marginTop: '20px' }}
                      onClick={handleCalcular}
                    >Calcular</Button>
                  </Grid>

                </Grid>
              </Grid>
            </Card>
          </>
        }

        {
          calculadoFinal &&
          <>
            <Card style={{ padding: '20px', marginTop: '20px' }} alignItems="center" justifyContent="center">
              <Typography variant="h2" gutterBottom align="center" color="primary" style={{ marginBottom: '20px', fontSize: '30px' }}>
                Subneteo final
              </Typography>

              <Grid container spacing={3} style={{ marginBottom: '20px' }}>
                <Grid item xs={12}>
                  <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Subred</TableCell>
                          <TableCell align="right">Número de hosts</TableCell>
                          <TableCell align="right">Primer host</TableCell>
                          <TableCell align="right">Último host</TableCell>
                          <TableCell align="right">Máscara</TableCell>
                          <TableCell align="right">Dirección de red</TableCell>
                          <TableCell align="right">Broadcast</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {
                          datos.subredes.map((subred, index) => (
                            <TableRow key={index}>
                              <TableCell component="th" scope="row">
                                {subred.nombre}
                              </TableCell>
                              <TableCell align="right">
                                {subred.hosts_solicitados}
                              </TableCell>
                              <TableCell align="right">
                                {subred.direcciones.primera_ip}
                              </TableCell>
                              <TableCell align="right">
                                {subred.direcciones.ultima_ip}
                              </TableCell>
                              <TableCell align="right">
                                {subred.direcciones.mascara}
                              </TableCell>
                              <TableCell align="right">
                                {subred.direcciones.direccion_red}
                              </TableCell>
                              <TableCell align="right">
                                {subred.direcciones.broadcast}
                              </TableCell>
                            </TableRow>
                          ))
                        }
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Card>
          </>
        }

      </Container>

      <Modal
        open={ErrorDialogo}
        onClose={
          () => {
            mostrarErrorDialogo(false);
          }
        }
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Error en los datos
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Por favor, verifique que los datos ingresados sean correctos:
            {
              error.ip.error &&
              <>
                <Typography variant="h6" gutterBottom align="left" color="error" style={{ marginBottom: '20px', fontSize: '16px' }}> - Dirección IP: {datos.ip} ({error.ip.mensaje})</Typography>
              </>
            }
            {
              error.prefijo.error &&
              <>
                <Typography variant="h6" gutterBottom align="left" color="error" style={{ marginBottom: '20px', fontSize: '16px' }}> - Prefijo de red: {datos.prefijo} ({error.prefijo.mensaje})</Typography>
              </>
            }
            {
              error.subredes.error &&
              <>
                <Typography variant="h6" gutterBottom align="left" color="error" style={{ marginBottom: '20px', fontSize: '16px' }}> - Número de subredes: {datos.subredes_cantidad} ({error.subredes.mensaje})</Typography>
              </>
            }

          </Typography>
        </Box>
      </Modal>
    </>
  );
}
