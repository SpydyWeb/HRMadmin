export const IpAddress = {
  _wer: (_jp: string) => {
    return IpAddress._mQ(_jp)
  },
  _rp: (_jp: string) => {
    return IpAddress._iz(_jp)
  },
  _mQ: (_ap: string) => {
    return IpAddress._fT(_ap)
  },
  _fT: (input: string) => {
    return IpAddress._ye(input).split('').reverse().join('')
  },
  _ye: (input: string) => {
    return IpAddress._sw(input).replace(/[^A-Za-z0-9]/g, '')
  },
  _sw: (input: string) => {
    return input.substr(0, 32)
  },
  _iz: (_a: string) => {
    const midIndex = Math.floor(_a.length / 2)
    return IpAddress._cz(_a.substr(midIndex, 32))
  },
  _cz: (input: string) => {
    const sorted = input.split('').sort().join('')
    return IpAddress._ep(sorted)
  },
  _ep: (input: string) => {
    return input.substr(0, 16)
  },
}
