import numpy as np

def lerMalha(nome):
    """Recebe uma string com o nome do arquivo .obj a ser lido. Retorna um
    np.ndarray com as x,y,z coordenadas dos pontos (uma coluna é um ponto) da
    malha e uma lista de strings, onde cada elemento da lista define uma face."""
    vertices = []
    faces = []
    arquivo = open(nome, "r")
    for line in arquivo:
        if line[0] == "v":
            partes = line.split(" ")
            vertices.append([float(partes[1]), float(partes[2]),\
                             float(partes[3])])
        if line[0] == "f":
            faces.append(line)
    arquivo.close()
    pontos = np.transpose(np.array(vertices))
    return pontos, faces

    
def escreverMalha(pontos, faces, nome):
    """Recebe uma nd.array com x,y,z coordenadas de todos os pontos da malha,
    uma lista com os strings representando as faces da malha e
    um nome do arquivo no qual a malha deve ser escrita (em formato .obj)."""
    novo = np.transpose(pontos)
    arquivo = open(nome, "w")
    for ponto in novo:
        arquivo.write("v ")
        for eixo in ponto:
            arquivo.write(str(eixo) + " ")
        arquivo.write("\n")
        
    for face in faces:
        arquivo.write(face)       
    arquivo.close()

    def scaling(x, y, z):
  matrix = np.array([[x, 0, 0, 0],
                     [0, y, 0, 0],
                     [0, 0, z, 0],
                     [0, 0, 0, 1]])            
  return matrix

def translation(x, y, z):
  matrix = np.array([[1, 0, 0, x],
                     [0, 1, 0, y],
                     [0, 0, 1, z],
                     [0, 0, 0, 1]]) 
  return matrix

def rotX(pi):
  c = np.cos(pi)
  s = np.sin(pi)
  matrix = np.array([[1, 0, 0, 0],
                     [0, c, -s, 0],
                     [0, s, c, 0],
                     [0, 0, 0, 1]]) 
  return matrix

def rotZ(pi):
  c = np.cos(pi)
  s = np.sin(pi)
  matrix = np.array([[c, -s, 0, 0],
                     [s, c, 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]]) 
  return matrix

def transformacaoAfim(pts):
    """Recebe um np.ndarray com x,y,z coordenadas de pontos. A função adiciona
    a 4a coordenada para representar os pontos em coordenadas homogêneas
    e aplica uma transformação afim. O valor de retorno é um np.ndarray
    com x,y,z coordenadas dos pontos transformados."""
    # crie a matriz composta de todas as transformações em coordenadas homogêneas
    # multiplique os pontos em coordenadas homogêneas por essa matriz
    # descarte a 4a coordenada e retorna apenas as coordenadas x,y,z dos pontos

    ###########
    pi = np.pi
    translationMatrix = translation(0, -np.min(pts[1]), 0)

    rotateDirectXZ = rotX(pi/2)
    rotateDirectY = rotZ(-pi/2)

    height = np.max(pts[1]) - np.min(pts[1])
    escale = 1/height
    escaledMatrix = scaling(escale, escale, escale)

    transformationMatrix = escaledMatrix @ rotateDirectY @ rotateDirectXZ @ translationMatrix

    coordinatedPoints = np.vstack((pts, np.ones(pts.shape[1])))

     #transformação sobre os pontos
    coordinatedPoints = transformationMatrix @ coordinatedPoints

    #retirar a quarta coordenada dos pontos do Bob.
    pts = np.delete(coordinatedPoints, 3, 0)
    
    return pts

pontos, faces = lerMalha("bob.obj")
pontos = transformacaoAfim(pontos)
escreverMalha(pontos, faces, "bob_novo.obj")
