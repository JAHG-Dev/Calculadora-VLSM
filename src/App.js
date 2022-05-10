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
    direccion_red: '192.168.0.0',
    prefijo: '24',
    subredes_cantidad: 1,
    salto_actual: 0,
    subredes: [
      {
        id: 1,
        nombre: 'S1',
        hosts_solicitados: 0,
        hosts_reservados: 0,
        hosts_disponibles: 0,
        bits_host: 0,
        bits_subred: 0,
        salto: 0,
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
          hosts_reservados: 0,
          hosts_disponibles: 0,
          bits_host: 0,
          bits_subred: 0,
          salto: 0,
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

  function calcularBitsHost(hosts) {

    for (var index = 0; index <= 32; index++) {
      if (hosts <= Math.pow(2, index) - 2) {
        return index;
      }
    }
    return 0;
  }

  function convertirPrefijoAMascaraDecimal(prefijo) {
    var mascara = '';
    for (var index = 0; index < prefijo; index++) {
      mascara += '1';
    }
    for (index = 0; index < 32 - prefijo; index++) {
      mascara += '0';
    }

    var mascara_octetos = mascara.match(/.{1,8}/g);

    var mascara_decimal = '';

    for (index = 0; index < mascara_octetos.length; index++) {
      mascara_decimal += parseInt(mascara_octetos[index], 2);
      if (index < mascara_octetos.length - 1) {
        mascara_decimal += '.';
      }
    }

    return mascara_decimal;
  }

  function calcularSalto(mascara) {
    var mascara_octetos = mascara.split('.');

    var ultimo_octeto = 0;
    for (var index = 0; index < mascara_octetos.length; index++) {
      if (mascara_octetos[index] !== '0') {
        ultimo_octeto = index;
      }
    }

    var salto = 256 - parseInt(mascara_octetos[ultimo_octeto], 10);

    datos.salto_actual += salto;
    return salto;
  }

  function calcularDireccionDeRed() {
    var direccion_ip = datos.ip.split('.');

    // Convertir primer octeto a binario y añadir ceros a la izquierda hasta que sea de 8 bits
    var primer_octeto = parseInt(direccion_ip[0], 10).toString(2);
    while (primer_octeto.length < 8) {
      primer_octeto = '0' + primer_octeto;
    }

    // Convertir segundo octeto a binario y añadir ceros a la izquierda hasta que sea de 8 bits
    var segundo_octeto = parseInt(direccion_ip[1], 10).toString(2);
    while (segundo_octeto.length < 8) {
      segundo_octeto = '0' + segundo_octeto;
    }

    // Convertir tercer octeto a binario y añadir ceros a la izquierda hasta que sea de 8 bits
    var tercer_octeto = parseInt(direccion_ip[2], 10).toString(2);
    while (tercer_octeto.length < 8) {
      tercer_octeto = '0' + tercer_octeto;
    }

    // Convertir cuarto octeto a binario y añadir ceros a la izquierda hasta que sea de 8 bits
    var cuarto_octeto = parseInt(direccion_ip[3], 10).toString(2);
    while (cuarto_octeto.length < 8) {
      cuarto_octeto = '0' + cuarto_octeto;
    }

    var direccion_red = primer_octeto + segundo_octeto + tercer_octeto + cuarto_octeto;

    var bits_host = 32 - datos.prefijo;

    direccion_red = direccion_red.split('');

    direccion_red.reverse();

    for (var index = 0; index < bits_host; index++) {
      direccion_red[index] = '0';
    }

    direccion_red.reverse();
    direccion_red = direccion_red.join('');

    // Poner un punto entre cada octeto
    direccion_red = direccion_red.match(/.{1,8}/g);

    // Convertir a decimal
    var direccion_red_decimal = '';
    for (index = 0; index < direccion_red.length; index++) {
      direccion_red_decimal += parseInt(direccion_red[index], 2);
      if (index < direccion_red.length - 1) {
        direccion_red_decimal += '.';
      }
    }

    return direccion_red_decimal;

  }
  
  function calcularDireccionDeRedSubredes( ) {
    
    var direccion_red = datos.direccion_red.split('.');

    if ( datos.prefijo <= 8 ) {
      direccion_red[0] = parseInt(direccion_red[0], 10) + datos.salto_actual;
    } else if ( datos.prefijo <= 16 ) {
      direccion_red[1] = parseInt(direccion_red[1], 10) + datos.salto_actual;
    } else if ( datos.prefijo <= 24 ) {
      direccion_red[2] = parseInt(direccion_red[2], 10) + datos.salto_actual;
    } else {
      direccion_red[3] = parseInt(direccion_red[3], 10) + datos.salto_actual;
    }

    direccion_red = direccion_red.join('.');

    return direccion_red;
  }

  // Calcular la primera direccion ip de la subred usando la direccion de red y el prefijo de la subred
  function calcularPrimeraDireccionSubred( direccion_red, prefijo ) {
    var direccion_red_octetos = direccion_red.split('.');

    if ( prefijo >= 20 ) {
      direccion_red_octetos[3] = parseInt(direccion_red_octetos[3], 10) + 1;
    } else if ( prefijo >= 16 ) {
      direccion_red_octetos[2] = parseInt(direccion_red_octetos[2], 10) + 1;
    } else if ( prefijo >= 12 ) {
      direccion_red_octetos[1] = parseInt(direccion_red_octetos[1], 10) + 1;
    } else {
      direccion_red_octetos[0] = parseInt(direccion_red_octetos[0], 10) + 1;
    }

    direccion_red_octetos = direccion_red_octetos.join('.');

    return direccion_red_octetos;
  }

  function calcularWildcard(mascara) {
    var wildcard = '0.0.0.0';

    wildcard = wildcard.split('.');
    mascara = mascara.split('.');

    wildcard[0] = 255 - parseInt(mascara[0], 10);
    wildcard[1] = 255 - parseInt(mascara[1], 10);
    wildcard[2] = 255 - parseInt(mascara[2], 10);
    wildcard[3] = 255 - parseInt(mascara[3], 10);

    wildcard = wildcard.join('.');

    console.log(wildcard);

    return wildcard;
  }

  function calcularSubredes() {
    ordenarSubredes();
    datos.direccion_red = calcularDireccionDeRed();

    datos.subredes.forEach(subred => {
      subred.bits_host = calcularBitsHost(subred.hosts_solicitados);
      subred.hosts_reservados = Math.pow(2, subred.bits_host) - 2;
      subred.hosts_disponibles = subred.hosts_reservados - subred.hosts_solicitados;

      subred.bits_subred = (32 - datos.prefijo) - subred.bits_host;

      subred.direcciones.prefijo = datos.prefijo + subred.bits_subred;

      subred.direcciones.mascara = convertirPrefijoAMascaraDecimal(subred.direcciones.prefijo);

      subred.direcciones.direccion_red = calcularDireccionDeRedSubredes();

      subred.salto = calcularSalto(subred.direcciones.mascara);

      subred.direcciones.primera_ip = calcularPrimeraDireccionSubred(subred.direcciones.direccion_red, subred.direcciones.prefijo);

      subred.direcciones.wildcard = calcularWildcard( subred.direcciones.mascara );

    });

    setCalculadoFinal(true);

  }


  const handleCalcular = () => {
    if (validar()) {
      calcularSubredes();
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
              style={{ width: '35%', marginTop: '20px' }}
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
                          <TableCell align="center">Número de hosts</TableCell>
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
                              <TableCell align="center">
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
                      style={{ width: '35%', marginTop: '20px' }}
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
                          <TableCell align="center">Subred</TableCell>
                          <TableCell align="center">Hosts solicitados</TableCell>
                          <TableCell align="center">Hosts asignados</TableCell>
                          <TableCell align="center">Hosts sin usar</TableCell>
                          <TableCell align="center">Dirección de red</TableCell>
                          <TableCell align="center">Prefijo</TableCell>
                          <TableCell align="center">Primer host</TableCell>
                          <TableCell align="center">Último host</TableCell>
                          <TableCell align="center">Máscara</TableCell>
                          <TableCell align="center">Broadcast</TableCell>
                          <TableCell align="center">Wildcard</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {
                          datos.subredes.map((subred, index) => (
                            <TableRow key={index}>
                              <TableCell component="th" scope="row" align="center">
                                {subred.nombre}
                              </TableCell>
                              <TableCell align="center">
                                {subred.hosts_solicitados}
                              </TableCell>
                              <TableCell align="center">
                                {subred.hosts_reservados}
                              </TableCell>
                              <TableCell align="center">
                                {subred.hosts_disponibles}
                              </TableCell>
                              <TableCell align="center">
                                {subred.direcciones.direccion_red}
                              </TableCell>
                              <TableCell align="center">
                                {subred.direcciones.prefijo}
                              </TableCell>
                              <TableCell align="center">
                                {subred.direcciones.primera_ip}
                              </TableCell>
                              <TableCell align="center">
                                {subred.direcciones.ultima_ip}
                              </TableCell>
                              <TableCell align="center">
                                {subred.direcciones.mascara}
                              </TableCell>

                              <TableCell align="center">
                                {subred.direcciones.broadcast}
                              </TableCell>

                              <TableCell align="center">
                                {subred.direcciones.wildcard}
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
