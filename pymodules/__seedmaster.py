import base64
from pymodules.__config import seed

def seedmaster(iterations):
    result = str(seed).encode('utf-8')
    
    for _ in range(iterations):
        result = base64.b64encode(result)
    
    if iterations == 0:
        return seed
    else:
        return result.decode('utf-8')

# Ejemplo de uso:
if __name__ == "__main__":
    valor0 = seedmaster(0)
    valor1 = seedmaster(1)
    valor2 = seedmaster(2)
    valor3 = seedmaster(3)

    print("Valor 0:", valor0)
    print("Valor 1:", valor1)
    print("Valor 2:", valor2)
    print("Valor 3:", valor3)
