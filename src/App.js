import { Button, Container, Typography, Card, TextField, form, Grid, InputAdornment, Select, InputLabel, MenuItem, FormControl, Modal } from '@mui/material';
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

  const [informacion, setInformacion] = useState({
    ip: '',
    direccion_red: '',
    mascara: '',
    broadcast: '',
  });

  var [datos, setdatos] = useState({
    ip: '',
    prefijo: '',
    subredes: ''
  });

  var [ErrorDialogo, mostrarErrorDialogo] = useState(false);

  var [error, seterror] = useState({
    ip: false,
    prefijo: false,
    subredes: false
  });

  const handleChange = (event) => {
    setdatos({
      ...datos,
      [event.target.name]: event.target.value
    });
  };

  function validarIP() {
    var ip = datos.ip.split('.');
    if (ip.length !== 4) {
      seterror({
        ...error,
        ip: true
      });
      return false;
    }
    for (var i = 0; i < ip.length; i++) {
      if (ip[i] < 0 || ip[i] > 255 || isNaN(ip[i])) {
        seterror({
          ...error,
          ip: true
        });
        return false;
      }
    }
    return true;
  }

  function validarPrefijo() {
    if (datos.prefijo < 0 || datos.prefijo > 32 || isNaN(datos.prefijo)) {
      seterror({
        ...error,
        prefijo: true
      });
      return false;
    }
    return true;
  }

  function validarSubredes() {
    if (datos.subredes < 0 || datos.subredes > 32 || isNaN(datos.subredes)) {
      seterror({
        ...error,
        subredes: true
      });
      return false;
    }
    return true;
  }

  function validar() {
    if (!validarIP()) {
      return false;
    }
    if (!validarPrefijo()) {
      return false;
    }
    if (!validarSubredes()) {
      return false;
    }
    return true;
  }

  function calcularMascara() {
    var mascara = '';

    for (var i = 0; i < datos.prefijo; i++) {
      mascara += '1';
    }

    for (var i = datos.prefijo; i < 32; i++) {
      mascara += '0';
    }

    mascara = mascara.match(/.{1,8}/g).join('.');

    var octetos = [
      mascara.split('.')[0],
      mascara.split('.')[1],
      mascara.split('.')[2],
      mascara.split('.')[3]
    ]

    octetos.map((octeto, index) => {
      octeto = parseInt(octeto, 2);
    });
    alert(octetos);


    return mascara;
  }

  function calcularBroadcast() {
    var ip = datos.ip.split('.');
    var mascara = calcularMascara();
    var broadcast = '';
    for (var i = 0; i < ip.length; i++) {
      broadcast += parseInt(ip[i], 10) | parseInt(mascara[i], 10);
      if (i < ip.length - 1) {
        broadcast += '.';
      }
    }
    return broadcast;
  }

  function handlecalcular() {
    if (validar()) {
      iscalculado(true);
      setInformacion({
        ip: datos.ip,
        direccion_red: datos.ip + '/' + datos.prefijo,
        mascara: calcularMascara(),
        broadcast: calcularBroadcast()
    });
    } else {
      mostrarErrorDialogo(true);
    }
  }


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
                onChange={handleChange} />
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
                id="subredes"
                name="subredes"
                label="Número de subredes"
                variant="outlined"
                width="100%"
                type="number"
                style={{ width: '100%' }}
                inputProps={{
                  min: 1,
                  max: 32
                }}
                helperText='Ejemplo: 6'
                onChange={handleChange} />
            </Grid>
          </Grid>

          <Grid container justifyContent={'center'} alignItems={'center'}>
            <Button
              variant="contained"
              color="info"
              size="large"
              style={{ width: '20%', marginTop: '20px' }}
              onClick={handlecalcular}
            >Calcular </Button>
          </Grid>
        </Card>

        {calculado &&
          <Card style={{ padding: '20px', marginTop: '20px' }} alignItems="center" justifyContent="center">
            <Typography variant="h2" gutterBottom align="center" color="primary" style={{ marginBottom: '20px', fontSize: '30px' }}>
              Información
            </Typography>

            <Grid container spacing={3} style={{ marginBottom: '20px' }}>
              <Grid item xs={6}>
                <Typography variant="h6" gutterBottom align="left" color="primary" style={{ marginBottom: '20px', fontSize: '18px' }}> Dirección IP: {informacion.ip}</Typography>
                <Typography variant="h6" gutterBottom align="left" color="primary" style={{ marginBottom: '20px', fontSize: '18px' }}> Dirección de red: {informacion.direccion_red}</Typography>
                <Typography variant="h6" gutterBottom align="left" color="primary" style={{ marginBottom: '20px', fontSize: '18px' }}> Máscara de red: {informacion.mascara}</Typography>
                <Typography variant="h6" gutterBottom align="left" color="primary" style={{ marginBottom: '20px', fontSize: '18px' }}> Broadcast: {informacion.broadcast}</Typography>
              </Grid>
            </Grid>
          </Card>}
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
                error.ip &&
                  <Typography variant="h6" gutterBottom align="left" color="error" style={{ marginBottom: '20px', fontSize: '16px' }}> - Dirección IP: {datos.ip} (Inválida)</Typography>
              }

              {
                error.prefijo &&
                  <Typography variant="h6" gutterBottom align="left" color="error" style={{ marginBottom: '20px', fontSize: '16px' }}> - Prefijo de red: {datos.prefijo} </Typography>
              }

              {
                error.redes &&
                  <Typography variant="h6" gutterBottom align="left" color="error" style={{ marginBottom: '20px', fontSize: '16px' }}> - Número de redes: {datos.redes} </Typography>
              }
            </Typography>
          </Box>
      </Modal>
    </>
  );
}