const modeNumber: number[] = [0, 1, 3];
const modulation: string[] = ['AFSK', 'GMSK', 'GMSK'];
const baudrate: number[] = [1200, 9600, 13653];
const protocol: string[] = ['AX.25', 'AX.25', 'AX.25'];

const fmMode: Record<
    number,
    { modulation: string; baudrate: number; protocol: string }
> = {};

modeNumber.forEach((number, i) => {
    fmMode[number] = {
        modulation: modulation[i],
        baudrate: baudrate[i],
        protocol: protocol[i],
    };
});

export default fmMode;
