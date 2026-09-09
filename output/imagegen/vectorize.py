import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parent/'tooling-py'))
import vtracer
vtracer.convert_image_to_svg_py(sys.argv[1],sys.argv[2],colormode='color',hierarchical='stacked',mode='spline',filter_speckle=4,color_precision=8,layer_difference=1,corner_threshold=60,length_threshold=4,max_iterations=10,splice_threshold=45,path_precision=2)
