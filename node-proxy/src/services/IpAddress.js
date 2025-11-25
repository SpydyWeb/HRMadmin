const IpAddress = {
  _wer: (_jp) => {
    return IpAddress._mQ(_jp);
  },
  _rp: (_jp) => {
    return IpAddress._iz(_jp);
  },
  _mQ: (_ap) => {
    return IpAddress._fT(_ap);
  },
  _fT: (input) => {
    return IpAddress._ye(input).split("").reverse().join("");
  },
  _ye: (input) => {
    return IpAddress._sw(input).replace(/[^A-Za-z0-9]/g, "");
  },
  _sw: (input) => {
    return input.substr(0, 32);
  },
  _iz: (_a) => {
    const midIndex = Math.floor(_a.length / 2);
    return IpAddress._cz(_a.substr(midIndex, 32));
  },
  _cz: (input) => {
    const sorted = input.split("").sort().join("");
    return IpAddress._ep(sorted);
  },
  _ep: (input) => {
    return input.substr(0, 16);
  },
};

module.exports = { IpAddress };
