import { Injectable } from '@angular/core';

export interface Seleccion {
  id: number;
  nombre: string;
}

export interface Estadio {
  id: number;
  nombre: string;
  ciudad: string;
}

export interface Ciudad {
  id: number;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  readonly selecciones: Seleccion[] = [
    { id: 1, nombre: 'México' },
    { id: 2, nombre: 'Sudáfrica' },
    { id: 3, nombre: 'Corea del Sur' },
    { id: 4, nombre: 'República Checa' },
    { id: 5, nombre: 'Canadá' },
    { id: 6, nombre: 'Bosnia y Herzegovina' },
    { id: 7, nombre: 'Qatar' },
    { id: 8, nombre: 'Suiza' },
    { id: 9, nombre: 'Brasil' },
    { id: 10, nombre: 'Marruecos' },
    { id: 11, nombre: 'Haití' },
    { id: 12, nombre: 'Escocia' },
    { id: 13, nombre: 'Estados Unidos' },
    { id: 14, nombre: 'Paraguay' },
    { id: 15, nombre: 'Australia' },
    { id: 16, nombre: 'Turquía' },
    { id: 17, nombre: 'Alemania' },
    { id: 18, nombre: 'Curazao' },
    { id: 19, nombre: 'Costa de Marfil' },
    { id: 20, nombre: 'Ecuador' },
    { id: 21, nombre: 'Países Bajos' },
    { id: 22, nombre: 'Japón' },
    { id: 23, nombre: 'Suecia' },
    { id: 24, nombre: 'Túnez' },
    { id: 25, nombre: 'Bélgica' },
    { id: 26, nombre: 'Egipto' },
    { id: 27, nombre: 'RI de Irán' },
    { id: 28, nombre: 'Nueva Zelanda' },
    { id: 29, nombre: 'España' },
    { id: 30, nombre: 'Islas de Cabo Verde' },
    { id: 31, nombre: 'Arabia Saudí' },
    { id: 32, nombre: 'Uruguay' },
    { id: 33, nombre: 'Francia' },
    { id: 34, nombre: 'Senegal' },
    { id: 35, nombre: 'Irak' },
    { id: 36, nombre: 'Noruega' },
    { id: 37, nombre: 'Argentina' },
    { id: 38, nombre: 'Argelia' },
    { id: 39, nombre: 'Austria' },
    { id: 40, nombre: 'Jordania' },
    { id: 41, nombre: 'Portugal' },
    { id: 42, nombre: 'RD Congo' },
    { id: 43, nombre: 'Uzbekistán' },
    { id: 44, nombre: 'Colombia' },
    { id: 45, nombre: 'Inglaterra' },
    { id: 46, nombre: 'Croacia' },
    { id: 47, nombre: 'Ghana' },
    { id: 48, nombre: 'Panamá' },
  ];

  readonly estadios: Estadio[] = [
    { id: 1, nombre: 'Estadio Azteca', ciudad: 'Ciudad de Mexico' },
    { id: 2, nombre: 'MetLife Stadium', ciudad: 'Nueva Jersey' },
    { id: 3, nombre: 'SoFi Stadium', ciudad: 'Los Angeles' },
    { id: 4, nombre: 'Hard Rock Stadium', ciudad: 'Miami' },
    { id: 5, nombre: 'AT&T Stadium', ciudad: 'Dallas' },
    { id: 6, nombre: 'BC Place', ciudad: 'Vancouver' },
    { id: 7, nombre: 'BMO Field', ciudad: 'Toronto' },
    { id: 8, nombre: 'NRG Stadium', ciudad: 'Houston' },
  ];

  readonly ciudades: Ciudad[] = [
    { id: 1, nombre: 'Ciudad de Mexico' },
    { id: 2, nombre: 'Nueva Jersey' },
    { id: 3, nombre: 'Los Angeles' },
    { id: 4, nombre: 'Miami' },
    { id: 5, nombre: 'Dallas' },
    { id: 6, nombre: 'Vancouver' },
    { id: 7, nombre: 'Toronto' },
    { id: 8, nombre: 'Houston' },
  ];
}
