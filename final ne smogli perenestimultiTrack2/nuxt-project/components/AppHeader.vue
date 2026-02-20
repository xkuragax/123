<template>
  <header class="bg-dark-light border-b border-gray-800 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-14 sm:h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center space-x-2 sm:space-x-3">
          <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg">
            <i class="fas fa-music text-white text-sm sm:text-base"></i>
          </div>
          <span class="text-lg sm:text-xl font-bold text-white">MultiTrack</span>
        </NuxtLink>
        
        <!-- Navigation -->
        <nav class="flex items-center space-x-1 sm:space-x-6">
          <NuxtLink 
            to="/" 
            class="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition text-sm sm:text-base"
            :class="{ 'text-primary bg-gray-800': $route.path === '/' }"
          >
            <i class="fas fa-compact-disc mr-1.5 sm:mr-2"></i>
            <span class="hidden sm:inline">Альбомы</span>
            <span class="sm:hidden">Альбомы</span>
          </NuxtLink>
          <NuxtLink 
            to="/admin" 
            class="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition text-sm sm:text-base"
            :class="{ 'text-primary bg-gray-800': $route.path === '/admin' }"
          >
            <i class="fas fa-cog mr-1.5 sm:mr-2"></i>
            <span class="hidden sm:inline">Админка</span>
            <span class="sm:hidden">Админ</span>
          </NuxtLink>
        </nav>
      </div>
    </div>
  </header>
</template>