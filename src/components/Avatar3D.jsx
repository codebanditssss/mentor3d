'use client'
import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'

function Professor({ isTeaching, currentText }) {
  const group = useRef()

  useFrame((state) => {
    if (group.current && isTeaching) {
      // Simple breathing animation
      group.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
      // Slight head nod when speaking
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 3) * 0.1
    }
  })

  return (
    <group ref={group}>
      {/* Simple geometric professor representation */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#fdbcf4" />
      </mesh>
      
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.3, 1.2, 32]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.6, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
        <meshStandardMaterial color="#fdbcf4" />
      </mesh>
      <mesh position={[0.6, 0.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
        <meshStandardMaterial color="#fdbcf4" />
      </mesh>

      {/* Speech bubble when speaking */}
      {isTeaching && currentText && (
        <Html position={[1.5, 1.5, 0]} center>
          <div className="bg-white p-3 rounded-lg shadow-lg max-w-xs">
            <p className="text-sm text-gray-800">{currentText}</p>
          </div>
        </Html>
      )}
    </group>
  )
}

export default function Avatar3D({ 
  isTeaching = false, 
  currentText = "",
  onSpeakingComplete 
}) {
  const [isLoaded, setIsLoaded] = useState(false)

  // Text-to-Speech functionality
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1
      utterance.volume = 0.8
      
      const voices = speechSynthesis.getVoices()
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Karen') ||
        voice.name.includes('Samantha')
      )
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }
      
      utterance.onend = () => {
        if (onSpeakingComplete) onSpeakingComplete()
      }
      
      speechSynthesis.speak(utterance)
    }
  }

  useEffect(() => {
    if (isTeaching && currentText) {
      speakText(currentText)
    }
  }, [isTeaching, currentText])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  if (!isLoaded) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading AI Professor...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-96 bg-gradient-to-b from-blue-50 to-purple-50 rounded-lg overflow-hidden relative">
      <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <directionalLight position={[0, 10, 5]} intensity={0.5} />
        
        <Professor isTeaching={isTeaching} currentText={currentText} />
        
        <OrbitControls 
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
      
      {/* Status indicator */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${isTeaching ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
        <span className="text-sm text-gray-600">
          {isTeaching ? 'Teaching...' : 'Ready'}
        </span>
      </div>
    </div>
  )
}