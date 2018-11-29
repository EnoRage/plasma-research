package plasmacrypto

import (
	"math/big"

	"github.com/snjax/gmp"
)

var RSA_N *gmp.Int

type Accumulator struct {
	value *gmp.Int
}

func concatCopyPreAllocate(slices ...[]byte) []byte {
	var totalLen int
	for _, s := range slices {
		totalLen += len(s)
	}
	tmp := make([]byte, totalLen)
	var i int
	for _, s := range slices {
		i += copy(tmp[i:], s)
	}
	return tmp
}

func alignBytes(data []byte, nbytes int) []byte {
	res := make([]byte, nbytes)
	ldata := len(data)
	if ldata > nbytes {
		copy(res, data[ldata-nbytes:nbytes])
	} else {
		copy(res[nbytes-ldata:ldata], data)
	}
	return res
}

// ProveInclusion check proof that alpha \in [g, A].
// x - total accumulator exponent rate from g to A
// b, r - proving key
func ProveInclusion(g, A *Accumulator, b, r, alpha *big.Int) bool {
	h := new(gmp.Int).Exp(g.value, new(gmp.Int).SetBigInt(alpha), gmp.NewInt(0))
	B := new(gmp.Int).SetBytes(concatCopyPreAllocate(alignBytes(g.value.Bytes(), 256), alignBytes(A.value.Bytes(), 256), alignBytes(h.Bytes(), 256)))

	return new(gmp.Int).Mod(new(gmp.Int).Mul(new(gmp.Int).Exp(new(gmp.Int).SetBigInt(b), B, RSA_N), new(gmp.Int).
		Exp(h, new(gmp.Int).SetBigInt(r), RSA_N)), RSA_N).Cmp(A.value) == 0
}

// ProveExclusion check proof that alpha \notin [g, A].
// x - total accumulator exponent rate from g to A
// b, r, beta - proving key
func ProveExclusion(g, A *Accumulator, b, r, alpha, beta *big.Int) bool {
	if new(big.Int).GCD(nil, nil, alpha, beta).Cmp(big.NewInt(1)) != 0 {
		return false
	}

	h := new(gmp.Int).Exp(g.value, new(gmp.Int).SetBigInt(alpha), RSA_N)
	k := new(gmp.Int).Exp(g.value, new(gmp.Int).SetBigInt(beta), RSA_N)
	A1 := new(gmp.Int).Mod(new(gmp.Int).Mul(A.value, k), RSA_N)
	B := new(gmp.Int).SetBytes(concatCopyPreAllocate(alignBytes(g.value.Bytes(), 256), alignBytes(A1.Bytes(), 256), alignBytes(h.Bytes(), 256)))

	return new(gmp.Int).Mod(new(gmp.Int).Mul(new(gmp.Int).Exp(new(gmp.Int).SetBigInt(b), B, RSA_N), new(gmp.Int).
		Exp(h, new(gmp.Int).SetBigInt(r), RSA_N)), RSA_N).Cmp(A1) == 0
}

// GenProof generates proof that alpha \in [g, A].
// x - total accumulator exponent rate from g to A
// b, r - standard proving key components
// beta - remainder of the division x/alpha. It is zero for inclusion and non-zero for exclusion
func GenProof(g, A *Accumulator, _x *big.Int, _alpha *big.Int) (*big.Int, *big.Int, *big.Int) {
	x := new(gmp.Int).SetBigInt(_x)
	alpha := new(gmp.Int).SetBigInt(_alpha)
	y, beta := new(gmp.Int).DivMod(x, alpha, new(gmp.Int))
	h := new(gmp.Int).Exp(g.value, alpha, RSA_N)
	k := new(gmp.Int).Exp(g.value, beta, RSA_N)
	A1 := new(gmp.Int).Mod(new(gmp.Int).Mul(A.value, k), RSA_N)
	B := new(gmp.Int).SetBytes(concatCopyPreAllocate(alignBytes(g.value.Bytes(), 256), alignBytes(A1.Bytes(), 256), alignBytes(h.Bytes(), 256)))

	r := new(gmp.Int).Mod(y, B)
	b := new(gmp.Int).Exp(g.value, new(gmp.Int).Div(y, B), RSA_N)
	return b.BigInt(), r.BigInt(), beta.BigInt()
}

func (s *Accumulator) Value() *big.Int {
	return s.value.BigInt()
}

func (s *Accumulator) Clone() *Accumulator {
	return &Accumulator{new(gmp.Int).Set(s.value)}
}

func (s *Accumulator) SetInt(value *big.Int) *Accumulator {
	s.value = new(gmp.Int).SetBigInt(value)
	return s
}

func (A *Accumulator) Accumulate(m uint32) *Accumulator {
	A.value.Exp(A.value, new(gmp.Int).SetUint64(uint64(m)), RSA_N)
	return A
}

func (A *Accumulator) BatchAccumulate(m []uint32) *Accumulator {
	for _, item := range m {
		A.value.Exp(A.value, new(gmp.Int).SetUint64(uint64(item)), RSA_N)
	}
	return A
}

func init() {
	RSA_N, _ = new(gmp.Int).SetString("567929035180141836514505181906423395364637523630004296534953190382729779104946466808145060315889168832351514849254121460560401183992322798196778908172944282049652978082231651450413053439125399748245393342266673218282217648568535442341585489635580424585586470287479496263427647668461192988672198375100513080861861740024446157196344609240727691320480431925016302901626972655553323147580467130962657613063614438853373115971874156550263033759261564463537507073206949306302733535630290376417631219448330889587792553141466860019084109221241619362203348378019086836340012564980042874933081187422421309864488491570615053937", 10)
}
