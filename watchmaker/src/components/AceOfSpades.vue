<template>
  <div class="card">
    <div class="card-inner">
      <div class="card-front bg-white text-2xl font-bold text-black">ACE OF SPADES</div>
      <div class="card-back bg-red-500 text-5xl text-black">♠</div>
    </div>
  </div>
</template>
<style scoped>
.card {
  background-color: transparent;
  width: 150px;
  height: 300px;
  perspective: 1000px;
}
.card-inner {
  position: relative;

  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}
.card:hover .card-inner {
  transform: rotateY(180deg);
}
.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-items: center;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
.card-back {
  transform: rotateY(180deg);
}
</style>
